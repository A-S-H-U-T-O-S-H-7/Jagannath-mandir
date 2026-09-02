import { NextRequest, NextResponse } from 'next/server';

const WELCOME_EMAIL_URL = 'https://www.svsamiti.com/temple/welcom.php';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { status: false, message: 'Name and email are required' },
        { status: 400 },
      );
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());

    const response = await fetch(WELCOME_EMAIL_URL, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'User-Agent': 'Jagannath-Mandir/1.0',
      },
      body: formData,
    });

    const responseText = await response.text();
    let data: unknown = { status: false, message: 'Welcome email service returned an invalid response' };
    try {
      data = JSON.parse(responseText);
    } catch {
      // Preserve a safe, useful response when the upstream service does not return JSON.
    }

    return NextResponse.json(data, { status: response.ok ? 200 : 502 });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to send welcome email' },
      { status: 500 },
    );
  }
}
