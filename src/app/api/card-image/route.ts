import { NextRequest, NextResponse } from 'next/server';

const allowedHosts = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
]);

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url');
  if (!source) return new NextResponse('Missing image URL', { status: 400 });

  let imageUrl: URL;
  try {
    imageUrl = new URL(source);
  } catch {
    return new NextResponse('Invalid image URL', { status: 400 });
  }

  if (imageUrl.protocol !== 'https:' || !allowedHosts.has(imageUrl.hostname)) {
    return new NextResponse('Image source is not allowed', { status: 400 });
  }

  const image = await fetch(imageUrl, { next: { revalidate: 3600 } });
  if (!image.ok || !image.headers.get('content-type')?.startsWith('image/')) {
    return new NextResponse('Unable to load image', { status: 502 });
  }

  return new NextResponse(image.body, {
    headers: {
      'Content-Type': image.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
