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
  [key: string]: unknown;
};

export type DonationPaymentStatus = 'completed' | 'failed' | 'cancelled';

const CCAVENUE_RESPONSE_HANDLER = 'https://svsamiti.com/temple/ccavResponseHandler.php';

export function getRequestBaseUrl(request: Request): string {
  // Payment callbacks arrive at the public domain configured with CCAvenue.
  // Prefer that actual request origin so a stale local environment value cannot
  // redirect a donor to localhost after payment.
  try {
    return new URL(request.url).origin;
  } catch {
    return (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  }
}

export async function extractEncResp(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('encResp') || url.searchParams.get('enc_resp');
  if (fromQuery) return fromQuery;
  if (request.method === 'GET') return null;
  try {
    if ((request.headers.get('content-type') || '').includes('application/json')) {
      const body = await request.json();
      return typeof body?.encResp === 'string' ? body.encResp : null;
    }
    const formData = await request.formData();
    const value = formData.get('encResp') || formData.get('enc_resp');
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}

function normalizePaymentData(raw: unknown): CCAvenuePaymentData | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    const data: CCAvenuePaymentData = {};
    new URLSearchParams(raw).forEach((value, key) => { data[key] = value; });
    return Object.keys(data).length ? data : null;
  }
  return typeof raw === 'object' ? raw as CCAvenuePaymentData : null;
}

export async function decryptCCAvenueResponse(encResp: string): Promise<{ ok: boolean; data?: CCAvenuePaymentData; error?: string }> {
  try {
    const response = await fetch(CCAVENUE_RESPONSE_HANDLER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ encResp }),
    });
    if (!response.ok) return { ok: false, error: `CCAvenue response handler returned ${response.status}` };
    const parsed = await response.json() as { data?: unknown; message?: string; order_id?: string };
    const data = normalizePaymentData(parsed.data) || (parsed.order_id ? normalizePaymentData(parsed) : null);
    return data?.order_id ? { ok: true, data } : { ok: false, error: parsed.message || 'Unable to decrypt payment response' };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Payment decryption failed' };
  }
}

export function mapOrderStatus(orderStatus?: string): DonationPaymentStatus {
  const status = String(orderStatus || '').trim().toLowerCase();
  if (status === 'success') return 'completed';
  if (status === 'aborted') return 'cancelled';
  return 'failed';
}

export function buildSuccessRedirect(baseUrl: string, orderId: string): string {
  const url = new URL('/donate/success', baseUrl);
  url.searchParams.set('order_id', orderId);
  return url.toString();
}

export function buildFailedRedirect(baseUrl: string, params: Record<string, string | undefined>): string {
  const url = new URL('/donate/failed', baseUrl);
  Object.entries(params).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
  return url.toString();
}

export function buildMembershipSuccessRedirect(baseUrl: string, orderId: string): string {
  const url = new URL('/join-as-member/payment-success', baseUrl);
  url.searchParams.set('order_id', orderId);
  return url.toString();
}

export function buildMembershipFailedRedirect(baseUrl: string, params: Record<string, string | undefined>): string {
  const url = new URL('/join-as-member/payment-failed', baseUrl);
  Object.entries(params).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
  return url.toString();
}

export function amountsMatch(expected: number, received?: string): boolean {
  const actual = Number(String(received || '').replace(/,/g, ''));
  return Number.isFinite(actual) && Math.abs(expected - actual) < 0.01;
}
