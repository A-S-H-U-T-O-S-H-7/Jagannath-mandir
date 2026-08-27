import { NextRequest, NextResponse } from 'next/server';
import {
  extractEncResp,
  decryptCCAvenueResponse,
  mapOrderStatus,
  buildSuccessRedirect,
  buildFailedRedirect,
  getRequestBaseUrl,
  amountsMatch,
} from '@/lib/payment/ccavenue';
import { donationServer } from '@/lib/services/donationServer';

async function handleResponse(request: NextRequest) {
  const baseUrl = getRequestBaseUrl(request);

  try {
    const encResp = await extractEncResp(request);
    if (!encResp) {
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          message: 'Invalid payment response',
          status_message: 'No encryption data received',
        }),
        303
      );
    }

    const decrypted = await decryptCCAvenueResponse(encResp);
    if (!decrypted.ok || !decrypted.data) {
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          message: decrypted.error || 'Payment decryption failed',
          status_message: 'Decryption error',
        }),
        303
      );
    }

    const paymentData = decrypted.data;
    const orderId = paymentData.order_id;
    let orderStatus = mapOrderStatus(paymentData.order_status);

    const donationResult = await donationServer.getDonation(orderId || '');
    if (!donationResult.success || !donationResult.data) {
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          order_id: orderId,
          message: 'Donation not found',
          status_message: 'Invalid order',
        }),
        303
      );
    }

    const donation = donationResult.data;
    // Do not let a repeated, delayed, or conflicting callback downgrade a
    // donation that has already been confirmed as paid.
    const expectedAmount = donation.amount || 0;
    if (orderStatus === 'completed' && !amountsMatch(expectedAmount, paymentData.amount)) {
      console.warn(`Amount mismatch: Expected ${expectedAmount}, Received ${paymentData.amount}`);
      orderStatus = 'failed';
      paymentData.failure_message = 'Paid amount did not match donation amount';
    }

    const updateResult = await donationServer.updateDonationStatus(
      orderId!,
      orderStatus,
      paymentData
    );

    if (!updateResult.success) {
      console.error('Failed to update donation status:', updateResult.error);
      return NextResponse.redirect(
        buildFailedRedirect(baseUrl, {
          order_id: orderId,
          message: 'Failed to update donation status',
          status_message: 'Database error',
        }),
        303
      );
    }

    if (orderStatus === 'completed') {
      return NextResponse.redirect(buildSuccessRedirect(baseUrl, orderId!), 303);
    }

    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        order_id: orderId,
        message: paymentData.failure_message || paymentData.status_message || 'Payment failed',
        failure_message: paymentData.failure_message || paymentData.status_message || 'Payment failed',
        status_message: paymentData.status_message || orderStatus,
        amount: paymentData.amount,
      }),
      303
    );
  } catch (error: any) {
    console.error('CCAvenue response error:', error);
    return NextResponse.redirect(
      buildFailedRedirect(baseUrl, {
        message: error.message || 'Payment processing failed',
        status_message: 'Server error',
      }),
      303
    );
  }
}

export async function POST(request: NextRequest) {
  return handleResponse(request);
}

export async function GET(request: NextRequest) {
  return handleResponse(request);
}
