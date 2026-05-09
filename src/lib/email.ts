/**
 * Email sender via exe.dev gateway.
 *
 * The exe.dev email API can only deliver to:
 *   - The VM owner / team members
 *   - Users who have previously authenticated to your exe.dev VM
 *
 * For production use with arbitrary end-user emails, configure an external
 * SMTP provider and set SMTP_HOST / SMTP_USER / SMTP_PASS env vars, or
 * replace this module with Resend / SendGrid / etc.
 *
 * Docs: https://exe.dev/docs/send-email
 */

const EXE_DEV_GATEWAY = "http://169.254.169.254/gateway/email/send";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://adofai.net";
const FROM_NAME = "ADOFAI.NET";

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  reply_to?: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const res = await fetch(EXE_DEV_GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!data.success) {
      console.warn("[email] send failed:", data.error);
    }
    return data.success === true;
  } catch (e) {
    console.error("[email] gateway error:", e);
    return false;
  }
}

export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const link = `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: `Verify your ${FROM_NAME} account`,
    body: [
      `Welcome to ${FROM_NAME}!`,
      "",
      "Please verify your email address by clicking the link below:",
      link,
      "",
      "This link expires in 24 hours.",
      "",
      "If you did not create an account, you can safely ignore this email.",
      "",
      `— The ${FROM_NAME} team`,
    ].join("\n"),
    reply_to: "no-reply@adofai.net",
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: `Reset your ${FROM_NAME} password`,
    body: [
      `You requested a password reset for your ${FROM_NAME} account.`,
      "",
      "Click the link below to set a new password:",
      link,
      "",
      "This link expires in 1 hour.",
      "",
      "If you did not request this, please ignore this email.",
      "",
      `— The ${FROM_NAME} team`,
    ].join("\n"),
    reply_to: "no-reply@adofai.net",
  });
}

/** Very basic disposable email domain blocklist */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "throwaway.email", "yopmail.com", "sharklasers.com", "guerrillamailblock.com",
  "grr.la", "guerrillamail.info", "trashmail.com", "fakeinbox.com",
  "dispostable.com", "spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
  "maildrop.cc", "spamex.com", "tempr.email", "discard.email",
  "spamfree24.org", "spam4.me", "trashmail.at", "trashmail.io",
  "tempinbox.com", "temp-mail.org", "throwam.com", "filzmail.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}
