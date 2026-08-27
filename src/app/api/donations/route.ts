import { NextResponse } from 'next/server';
import { donationServer } from '@/lib/services/donationServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      donorDetails,
      amount,
      currency,
      purpose,
      donorType,
      taxExemption,
    } = body;

    if (!id || !donorDetails?.name || !donorDetails?.email || !donorDetails?.mobile || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required donation fields' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    const result = await donationServer.createDonation({
      id,
      donationId: id,
      userId: userId || null,
      donorDetails,
      amount: parsedAmount,
      currency: currency || 'INR',
      status: 'pending_payment',
      paymentGateway: 'ccavenue',
      purpose: purpose || 'General Donation',
      donorType: donorType === 'foreign' ? 'foreign' : 'indian',
      taxExemption: taxExemption || {
        eligible: true,
        section: '80G',
        certificateRequired: true,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create donation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, donationId: result.donationId });
  } catch (error: any) {
    console.error('POST /api/donations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create donation' },
      { status: 500 }
    );
  }
}
