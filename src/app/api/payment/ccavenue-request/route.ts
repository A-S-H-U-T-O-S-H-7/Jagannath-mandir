import { NextRequest, NextResponse } from 'next/server';
import { donationServer } from '@/lib/services/donationServer';
import {
  encryptCCAvenue,
  getCCAvenueConfig,
  getRequestBaseUrl,
  toMerchantQuery,
} from '@/lib/payment/ccavenue';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { workingKey, accessCode, merchantId, paymentUrl, mode } = getCCAvenueConfig();

    if (!workingKey || !accessCode || !merchantId) {
      return NextResponse.json(
        {
          status: false,
          errors: ['CCAvenue is not configured. Set CCAVENUE_WORKING_KEY, CCAVENUE_ACCESS_CODE, and CCAVENUE_MERCHANT_ID.'],
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      order_id,
      purpose,
      amount,
      name,
      email,
      phone,
      address,
      donor_type,
      country,
    } = body;

    if (!order_id || !amount || !name || !email || !phone) {
      return NextResponse.json(
        { status: false, errors: ['Missing required fields'] },
        { status: 400 }
      );
    }

    const donationResult = await donationServer.getDonation(order_id);
    if (!donationResult.success || !donationResult.data) {
      return NextResponse.json(
        { status: false, errors: ['Donation not found'] },
        { status: 404 }
      );
    }

    const donation = donationResult.data;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { status: false, errors: ['Invalid donation amount'] },
        { status: 400 }
      );
    }

    if (Math.abs(parsedAmount - Number(donation.amount)) > 0.01) {
      return NextResponse.json(
        { status: false, errors: ['Amount does not match donation record'] },
        { status: 400 }
      );
    }

    const baseUrl = getRequestBaseUrl(request);
    const formattedAmount = parsedAmount.toFixed(2);

    const paymentData = {
      merchant_id: merchantId,
      order_id,
      currency: 'INR',
      amount: formattedAmount,
      redirect_url: `${baseUrl}/api/payment/ccavenue-response`,
      cancel_url: `${baseUrl}/api/payment/ccavenue-cancel`,
      language: 'EN',
      billing_name: name,
      billing_email: email,
      billing_tel: phone,
      billing_address: address || donation.donorDetails.address || 'NA',
      billing_city: donation.donorDetails.city || 'Delhi',
      billing_state: donation.donorDetails.state || 'Delhi',
      billing_zip: donation.donorDetails.pincode || '110001',
      billing_country: country || donation.donorDetails.country || 'India',
      delivery_name: name,
      delivery_email: email,
      delivery_tel: phone,
      delivery_address: address || donation.donorDetails.address || 'NA',
      delivery_city: donation.donorDetails.city || 'Delhi',
      delivery_state: donation.donorDetails.state || 'Delhi',
      delivery_zip: donation.donorDetails.pincode || '110001',
      delivery_country: country || donation.donorDetails.country || 'India',
      merchant_param1: donor_type || donation.donorType || 'indian',
      merchant_param2: purpose || donation.purpose || 'donation',
      merchant_param3: (donation.donorDetails.name || name).slice(0, 100),
      merchant_param4: (donation.donorDetails.email || email).slice(0, 100),
      merchant_param5: (donation.donorDetails.mobile || phone).slice(0, 100),
    };

    const encRequest = encryptCCAvenue(toMerchantQuery(paymentData), workingKey);

    return NextResponse.json({
      status: true,
      encRequest,
      access_code: accessCode,
      paymentUrl,
      mode,
    });
  } catch (error: any) {
    console.error('CCAvenue request error:', error);
    return NextResponse.json(
      { status: false, errors: [error.message || 'Payment request failed'] },
      { status: 500 }
    );
  }
}
