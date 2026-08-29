import { NextResponse } from 'next/server';
import { membershipServer } from '@/lib/services/membershipServer';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await membershipServer.getApplication(decodeURIComponent(id || '').trim());
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  const application = result.data;
  return NextResponse.json({
    success: true,
    data: {
      id: application.id,
      fullName: application.fullName || '',
      membershipType: application.membershipType || '',
      amount: application.membershipAmount || 0,
      paymentStatus: application.paymentStatus || 'pending',
      transactionId: application.transactionId || application.paymentDetails?.tracking_id || '',
    },
  });
}
