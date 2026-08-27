import { NextResponse } from 'next/server';

const REQUEST_HANDLER = 'https://svsamiti.com/temple/ccavenueRequest.php';
const PAYMENT_URL = 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
const REDIRECT_URL = 'https://jagannathmandirnoida.svsamiti.com/api/payment/ccavenue-response';
const CANCEL_URL = 'https://jagannathmandirnoida.svsamiti.com/api/payment/ccavenue-cancel';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ['order_id', 'amount', 'name', 'email', 'phone'];
    const missing = required.filter((key) => !String(body[key] || '').trim());
    if (missing.length) return NextResponse.json({ status: false, errors: [`Missing fields: ${missing.join(', ')}`] }, { status: 400 });

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ status: false, errors: ['Invalid donation amount'] }, { status: 400 });

    const payload = {
      order_id: String(body.order_id).trim(), amount: amount.toFixed(2), name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(), phone: String(body.phone).replace(/\D/g, ''),
      address: String(body.address || 'India').trim(), purpose: String(body.purpose || 'General Donation').trim(),
      donor_type: String(body.donor_type || 'indian').trim(), country: String(body.country || 'India').trim(),
      city: String(body.city || '').trim(), state: String(body.state || '').trim(),
      pincode: String(body.pincode || '').trim(),
      billing_city: String(body.city || '').trim(), billing_state: String(body.state || '').trim(),
      billing_zip: String(body.pincode || '').trim(), billing_country: String(body.country || 'India').trim(),
      redirect_url: REDIRECT_URL, cancel_url: CANCEL_URL,
    };
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
    const upstream = await fetch(REQUEST_HANDLER, { method: 'POST', body: formData });
    if (!upstream.ok) throw new Error(`CCAvenue request handler returned ${upstream.status}`);
    const result = await upstream.json();
    return NextResponse.json({
      status: Boolean(result.status), encRequest: result.encRequest, access_code: result.access_code,
      order_id: result.order_id || payload.order_id, paymentUrl: PAYMENT_URL, errors: result.errors,
    }, { status: result.status ? 200 : 400 });
  } catch (error: any) {
    console.error('ccavenue-request error:', error);
    return NextResponse.json({ status: false, errors: [error.message || 'Unable to start payment'] }, { status: 500 });
  }
}
