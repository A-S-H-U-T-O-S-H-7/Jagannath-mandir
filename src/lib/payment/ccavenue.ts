import crypto from 'crypto';

export type CCAvenuePaymentData = {
  order_id?: string;
  order_status?: string;
  tracking_id?: string;
  amount?: string;
  currency?: string;
  failure_message?: string;
  status_message?: string;
  bank_ref_no?: string;
  payment_mode?: string;
  billing_name?: string;
  billing_email?: string;
  [key: string]: unknown;
};

export type DonationPaymentStatus = 'completed' | 'failed' | 'cancelled';

const AES_IV = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

export function getCCAvenueConfig() {
  const workingKey = process.env.CCAVENUE_WORKING_KEY || '';
  const accessCode = process.env.CCAVENUE_ACCESS_CODE || '';
  const merchantId = process.env.CCAVENUE_MERCHANT_ID || '';
  const mode = (process.env.CCAVENUE_MODE || 'TEST').toUpperCase();
  const isLive = mode === 'LIVE' || mode === 'PROD' || mode === 'PRODUCTION';

  return {
    workingKey,
    accessCode,
    merchantId,
    mode: isLive ? 'LIVE' : 'TEST',
    paymentUrl: isLive
      ? 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
      : 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  };
}

export function getRequestBaseUrl(request: Request): string {
  const envBase = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (envBase) return envBase;

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = forwardedHost || request.headers.get('host');
  if (host) {
    const proto = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

function getAesKey(workingKey: string): Buffer {
  return crypto.createHash('md5').update(workingKey, 'utf8').digest();
}

/** Official CCAvenue AES-128-CBC (hex) — payload is merchant query string, not JSON. */
export function encryptCCAvenue(plainText: string, workingKey: string): string {
  const cipher = crypto.createCipheriv('aes-128-cbc', getAesKey(workingKey), AES_IV);
  return cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex');
}

export function decryptCCAvenue(encText: string, workingKey: string): string {
  const decipher = crypto.createDecipheriv('aes-128-cbc', getAesKey(workingKey), AES_IV);
  return decipher.update(encText, 'hex', 'utf8') + decipher.final('utf8');
}

export function toMerchantQuery(data: Record<string, string | number | undefined | null>): string {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');
}

export function parseMerchantQuery(decrypted: string): CCAvenuePaymentData {
  const data: CCAvenuePaymentData = {};
  decrypted.split('&').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx);
    const raw = pair.slice(idx + 1);
    try {
      data[key] = decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch {
      data[key] = raw;
    }
  });
  return data;
}

export async function extractEncResp(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('encResp') || url.searchParams.get('enc_resp');
  if (fromQuery) return fromQuery;

  if (request.method === 'GET') return null;

  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const value = body?.encResp || body?.enc_resp;
      return typeof value === 'string' ? value : null;
    }

    const formData = await request.formData();
    const value = formData.get('encResp') || formData.get('enc_resp');
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}

export function decryptCCAvenueResponse(
  encResp: string
): { ok: boolean; data?: CCAvenuePaymentData; error?: string } {
  try {
    const { workingKey } = getCCAvenueConfig();
    if (!workingKey) {
      return { ok: false, error: 'CCAVENUE_WORKING_KEY is not configured' };
    }

    const decrypted = decryptCCAvenue(encResp, workingKey);
    const paymentData = parseMerchantQuery(decrypted);

    if (!paymentData.order_id) {
      return { ok: false, error: 'Decrypted response is missing order_id' };
    }

    return { ok: true, data: paymentData };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Payment decryption failed' };
  }
}

export function mapOrderStatus(orderStatus?: string): DonationPaymentStatus {
  const normalized = String(orderStatus || '').trim().toLowerCase();

  if (normalized === 'success') return 'completed';
  if (normalized === 'aborted') return 'cancelled';
  return 'failed';
}

export function buildSuccessRedirect(baseUrl: string, orderId: string): string {
  const url = new URL('/donate/success', baseUrl);
  url.searchParams.set('order_id', orderId);
  return url.toString();
}

export function buildFailedRedirect(
  baseUrl: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL('/donate/failed', baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

export function amountsMatch(expected: number, received?: string): boolean {
  if (!received) return false;
  const parsed = parseFloat(String(received).replace(/,/g, ''));
  if (Number.isNaN(parsed)) return false;
  return Math.abs(expected - parsed) < 0.01;
}
