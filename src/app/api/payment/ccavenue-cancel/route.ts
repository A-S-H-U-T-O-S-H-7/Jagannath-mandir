import { NextResponse } from 'next/server';
import { donationServer } from '@/lib/services/donationServer';
import {
  buildFailedRedirect,
  decryptCCAvenueResponse,
  extractEncResp,
  getRequestBaseUrl,
} from '@/lib/payment/ccavenue';

async function handleCancel(request: Request) {
  const baseUrl = getRequestBaseUrl(request);
  const url = new URL(request.url);
  let orderId = url.searchParams.get('order_id') || undefined;

  try {
    const encResp = await extractEncResp(request);
    if (encResp) {
      const decrypted = decryptCCAvenueResponse(encResp);
      if (decrypted.ok && decrypted.data?.order_id) {
        orderId = String(decrypted.data.order_id);
      }
    }

    if (orderId) {
      await donationServer.updateDonationStatus(orderId, 'cancelled', {
        failure_message: 'Payment cancelled by user',
        order_status: 'Aborted',
        cancelledAt: new Date().toISOString(),
      });
    } else {
      console.warn('No order_id found in CCAvenue cancel request');
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
