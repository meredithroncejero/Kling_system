import { Resend } from 'resend';

// Load the Resend API key from environment variables.
// You should add RESEND_API_KEY to your .env.local file.
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a verification email using Resend.io.
 *
 * @param to - Recipient email address
 * @param verificationUrl - Full URL the user should click to verify their account
 * @param from - Optional custom "From" address (your verified domain)
 */
export async function sendVerificationEmail({
  to,
  verificationUrl,
  from = 'no-reply@your-custom-domain.com', // replace with your verified domain
}: {
  to: string;
  verificationUrl: string;
  from?: string;
}) {
  // Resend expects an HTML body. We'll keep it simple but you can style it.
  const html = `
    <p>Hello,</p>
    <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
    <p><a href="${verificationUrl}" style="display:inline-block;padding:8px 16px;background:#ff5a5f;color:#fff;border-radius:4px;text-decoration:none;">Verify Email</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Verify your email',
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    return { error: error.message };
  }
  return { success: true, data };
}
