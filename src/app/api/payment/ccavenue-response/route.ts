import { NextRequest, NextResponse } from 'next/server';
import {
  extractEncResp,
  decryptCCAvenueResponse,
  mapOrderStatus,
  buildSuccessRedirect,
  buildFailedRedirect,
  buildMembershipSuccessRedirect,
  buildMembershipFailedRedirect,
  getRequestBaseUrl,
  amountsMatch,
} from '@/lib/payment/ccavenue';
import { donationServer } from '@/lib/services/donationServer';
import { membershipServer } from '@/lib/services/membershipServer';
import { sendPaymentConfirmationEmail } from '@/lib/services/paymentConfirmationEmail';

async function handleMembershipResponse(
  baseUrl: string,
  orderId: string,
  orderStatus: 'completed' | 'failed' | 'cancelled',
  paymentData: Record<string, unknown>,
) {
  const applicationResult = await membershipServer.getApplication(orderId);
  if (!applicationResult.success) {
    return NextResponse.redirect(
      buildMembershipFailedRedirect(baseUrl, { order_id: orderId, message: applicationResult.error, status_message: 'Invalid order' }),
      303,
    );
  }

  let finalStatus = orderStatus;
  const expectedAmount = Number(applicationResult.data.membershipAmount || 0);
  if (finalStatus === 'completed' && !amountsMatch(expectedAmount, String(paymentData.amount || ''))) {
    finalStatus = 'failed';
    paymentData.failure_message = 'Paid amount did not match membership amount';
  }

  const paymentStatus = finalStatus === 'completed' ? 'paid' : finalStatus;
  const updateResult = await membershipServer.updatePaymentStatus(orderId, paymentStatus, paymentData);
  if (!updateResult.success) {
    return NextResponse.redirect(
      buildMembershipFailedRedirect(baseUrl, { order_id: orderId, message: updateResult.error, status_message: 'Database error' }),
      303,
    );
  }

  if (finalStatus === 'completed') {
    // CCAvenue may retry callbacks. Record successful delivery so a receipt is
    // sent only once for this membership payment.
    if (!applicationResult.data.paymentConfirmationEmailSentAt && applicationResult.data.email) {
      const paymentId = String(paymentData.transaction_id || paymentData.tracking_id || orderId);
      const emailSent = await sendPaymentConfirmationEmail({
        name: String(applicationResult.data.fullName || 'Member'),
        email: applicationResult.data.email,
        memberId: String(applicationResult.data.memberId || orderId),
        membershipPlan: String(applicationResult.data.membershipType || 'Membership'),
        amount: expectedAmount,
        paymentId,
        paymentDate: new Date().toISOString().slice(0, 10),
      }).catch((error) => {
        console.error('Payment confirmation email error:', error);
        return false;
      });

      if (emailSent) {
        await membershipServer.markPaymentConfirmationEmailSent(orderId)
          .catch((error) => console.error('Unable to record payment confirmation email:', error));
      }
    }
    return NextResponse.redirect(buildMembershipSuccessRedirect(baseUrl, orderId), 303);
  }

  return NextResponse.redirect(
    buildMembershipFailedRedirect(baseUrl, {
      order_id: orderId,
      message: String(paymentData.failure_message || paymentData.status_message || 'Payment failed'),
      status_message: String(paymentData.status_message || finalStatus),
      amount: String(paymentData.amount || ''),
    }),
    303,
  );
}

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

    if (orderId?.startsWith('MEM')) {
      return handleMembershipResponse(baseUrl, orderId, orderStatus, paymentData);
    }

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
