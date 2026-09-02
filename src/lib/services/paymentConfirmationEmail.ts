type PaymentConfirmationEmailData = {
  name: string;
  email: string;
  memberId: string;
  membershipPlan: string;
  amount: number;
  paymentId: string;
  paymentDate: string;
};

const PAYMENT_CONFIRMATION_URL = 'https://www.svsamiti.com/temple/confirm.php';

/** Sends the receipt email only from trusted server-side payment handling. */
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData): Promise<boolean> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('member_id', data.memberId);
  formData.append('membership_plan', data.membershipPlan);
  formData.append('amount', String(data.amount));
  formData.append('payment_id', data.paymentId);
  formData.append('payment_date', data.paymentDate);

  const response = await fetch(PAYMENT_CONFIRMATION_URL, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'User-Agent': 'Jagannath-Mandir/1.0',
    },
    body: formData,
  });

  if (!response.ok) return false;

  try {
    const result = await response.json() as { status?: boolean };
    return result.status === true;
  } catch {
    return false;
  }
}
