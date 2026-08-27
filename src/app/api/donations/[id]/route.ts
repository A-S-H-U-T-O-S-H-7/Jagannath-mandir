import { NextResponse } from 'next/server';
import { donationService } from '@/lib/services/donationService';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const donationId = decodeURIComponent(id || '').trim();

    if (!donationId) {
      return NextResponse.json(
        { success: false, error: 'Donation ID is required' },
        { status: 400 }
      );
    }

    const result = await donationService.getDonation(donationId);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Donation not found' },
        { status: 404 }
      );
    }

    const donation = result.data;

    return NextResponse.json({
      success: true,
      data: {
        id: donation.id || donation.donationId,
        amount: donation.amount,
        donorName: donation.donorDetails?.name || '',
        email: donation.donorDetails?.email || '',
        transactionId:
          donation.transactionId ||
          donation.paymentDetails?.tracking_id ||
          donation.paymentDetails?.transaction_id ||
          '',
        status: donation.status,
        failureMessage:
          donation.paymentDetails?.failure_message ||
          donation.paymentDetails?.status_message ||
          '',
        currency: donation.currency || 'INR',
        completedAt: donation.completedAt || null,
      },
    });
  } catch (error: any) {
    console.error('donations/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch donation' },
      { status: 500 }
    );
  }
}
