interface WelcomeEmailData {
  name: string;
  email: string;
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
