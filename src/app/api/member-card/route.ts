import { NextRequest, NextResponse } from 'next/server';
import type { MemberCardData } from '@/lib/memberCard';
import { generateMemberCardArtwork } from '@/lib/services/memberCardArtwork';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const required = ['name', 'memberId', 'memberSince'] as const;
    const optional = ['membershipPlan', 'bloodGroup', 'location', 'photoUrl'] as const;
    if (!body || !required.every((key) => typeof body[key] === 'string' && body[key].trim() && body[key].length <= 200) ||
      !optional.every((key) => body[key] === undefined || (typeof body[key] === 'string' && body[key].length <= (key === 'photoUrl' ? 2048 : 200)))) {
      return NextResponse.json({ message: 'Valid member details are required.' }, { status: 400 });
    }
    const data = Object.fromEntries([...required, ...optional].map((key) => [key, body[key]?.trim()])) as MemberCardData;
    return NextResponse.json(await generateMemberCardArtwork(data), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Member card rendering failed:', error);
    return NextResponse.json({ message: 'Unable to prepare the member card.' }, { status: 500 });
  }
}
