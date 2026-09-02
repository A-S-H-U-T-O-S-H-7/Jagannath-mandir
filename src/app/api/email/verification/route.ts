import { NextRequest, NextResponse } from 'next/server';
import { generateMemberCardPdf } from '@/lib/services/memberCardPdf';

const VERIFICATION_EMAIL_URL = 'https://www.svsamiti.com/temple/verification.php';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { name, email, memberId, memberSince, membershipPlan, bloodGroup, location, photoUrl } = await request.json();
    if (![name, email, memberId, memberSince].every((value) => typeof value === 'string' && value.trim())) {
      return NextResponse.json({ status: false, message: 'Name, email, member ID, and member since date are required' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('member_id', memberId.trim());
    formData.append('member_since', memberSince.trim());
    formData.append('community_name', 'Jagannath Mandir, Noida');
    const memberCardPdf = await generateMemberCardPdf({
      name: name.trim(),
      memberId: memberId.trim(),
      memberSince: memberSince.trim(),
      membershipPlan: typeof membershipPlan === 'string' ? membershipPlan : '',
      bloodGroup: typeof bloodGroup === 'string' ? bloodGroup : '',
      location: typeof location === 'string' ? location : '',
      photoUrl: typeof photoUrl === 'string' ? photoUrl : '',
    });
    formData.append('member_card_path', memberCardPdf.toString('base64'));
    formData.append('member_card_mime_type', 'application/pdf');
    formData.append('member_card_file_name', `${memberId.trim()}-member-card.pdf`);

    const response = await fetch(VERIFICATION_EMAIL_URL, {
      method: 'POST',
      headers: { Accept: '*/*', 'User-Agent': 'Jagannath-Mandir/1.0' },
      body: formData,
    });
    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data, { status: response.ok ? 200 : 502 });
    } catch {
      return NextResponse.json({ status: false, message: 'Verification email service returned an invalid response' }, { status: 502 });
    }
  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json({ status: false, message: 'Failed to send verification email' }, { status: 500 });
  }
}
