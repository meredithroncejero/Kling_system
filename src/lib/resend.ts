/**
 * Send a verification email using the Resend HTTP API.
 *
 * @param to - Recipient email address
 * @param verificationUrl - Full URL the user should click to verify their account
 * @param from - Optional custom "From" address from your verified domain
 */
export async function sendVerificationEmail({
  to,
  verificationUrl,
  from = "no-reply@your-custom-domain.com",
}: {
  to: string;
  verificationUrl: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { error: "RESEND_API_KEY is not configured." };
  }

  const html = `
    <p>Hello,</p>
    <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
    <p><a href="${verificationUrl}" style="display:inline-block;padding:8px 16px;background:#ff5a5f;color:#fff;border-radius:4px;text-decoration:none;">Verify Email</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Verify your email",
      html,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ?? data?.error ?? "Failed to send verification email.";
    console.error("Resend email error:", data ?? response.statusText);
    return { error: message };
  }

  return { success: true, data };
}
