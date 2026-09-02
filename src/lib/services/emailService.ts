interface WelcomeEmailData {
  name: string;
  email: string;
}

interface VerificationEmailData {
  name: string;
  email: string;
  memberId: string;
  memberSince: string;
  membershipPlan?: string;
  bloodGroup?: string;
  location?: string;
  photoUrl?: string;
}

/** Sends transactional emails through our server-side API proxy. */
export async function sendWelcomeEmail({ name, email }: WelcomeEmailData): Promise<void> {
  const response = await fetch('/api/email/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    throw new Error('Failed to send welcome email');
  }
}

export async function sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
  const response = await fetch('/api/email/verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) return false;
  const result = await response.json() as { status?: boolean };
  return result.status === true;
}
