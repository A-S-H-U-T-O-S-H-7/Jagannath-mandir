import { NextResponse } from 'next/server';
import { donationServer } from '@/lib/services/donationServer';
import { membershipServer } from '@/lib/services/membershipServer';
import {
  buildFailedRedirect,
  buildMembershipFailedRedirect,
  decryptCCAvenueResponse,
  extractEncResp,
  getRequestBaseUrl,
} from '@/lib/payment/ccavenue';

async function handleCancel(request: Request) {
  const baseUrl = getRequestBaseUrl(request);
  let orderId: string | undefined;

  try {
    const encResp = await extractEncResp(request);
    if (encResp) {
      const decrypted = await decryptCCAvenueResponse(encResp);
      if (decrypted.ok && decrypted.data?.order_id) {
        orderId = String(decrypted.data.order_id);
      } else {
        console.warn('Rejected unverified CCAvenue cancellation response');
      }
    }

    if (orderId?.startsWith('MEM')) {
      await membershipServer.updatePaymentStatus(orderId, 'cancelled', {
        failure_message: 'Payment cancelled by user',
        order_status: 'Aborted',
        cancelledAt: new Date().toISOString(),
      });
      return NextResponse.redirect(
        buildMembershipFailedRedirect(baseUrl, {
          order_id: orderId,
          message: 'Payment cancelled',
          status_message: 'Cancelled',
        }),
        303,
      );
    }

    if (orderId) {
      const donation = await donationServer.getDonation(orderId);
      if (donation.success && donation.data?.status !== 'completed') {
        await donationServer.updateDonationStatus(orderId, 'cancelled', {
          failure_message: 'Payment cancelled by user',
          order_status: 'Aborted',
          cancelledAt: new Date().toISOString(),
        });
      }
    } else {
      console.warn('No verified order_id found in CCAvenue cancel request');
    }
  } catch (error) {
    console.error('ccavenue-cancel error:', error);
  }

  return NextResponse.redirect(
    buildFailedRedirect(baseUrl, {
      order_id: orderId,
      message: 'Payment cancelled',
      status_message: 'Cancelled',
    }),
    303
  );
}

export async function GET(request: Request) {
  return handleCancel(request);
}

export async function POST(request: Request) {
  return handleCancel(request);
}
