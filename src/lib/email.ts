import { Resend } from "resend";

const APP_URL   = process.env.NEXT_PUBLIC_APP_URL ?? "https://adofai.net";
const FROM_NAME = "ADOFAI.NET";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  console.log("[email] Attempting send to:", to);
  console.log("[email] RESEND_API_KEY set:", !!apiKey);
  console.log("[email] From:", `${FROM_NAME} <${from}>`);

  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set — cannot send");
    return false;
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${from}>`,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend error:", error.name, error.message);
    return false;
  }

  console.log("[email] Sent successfully — id:", data?.id);
  return true;
}

function emailTemplate(title: string, body: string, buttonText: string, buttonUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#07070f;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#10101e;border:1px solid #1a1a35;border-radius:16px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#ff2244,#ff8800);display:inline-flex;align-items:center;justify-content:center;">
            <span style="font-size:22px;">&#128293;</span>
          </div>
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#f0f0ff;">${title}</h1>
        </td></tr>
        <tr><td style="padding-bottom:28px;font-size:14px;color:#7777aa;line-height:1.7;text-align:center;">
          ${body}
        </td></tr>
        <tr><td align="center" style="padding-bottom:28px;">
          <a href="${buttonUrl}" style="display:inline-block;padding:12px 32px;border-radius:12px;font-weight:700;font-size:14px;color:white;background:linear-gradient(135deg,#ff2244,#ff8800);text-decoration:none;">
            ${buttonText}
          </a>
        </td></tr>
        <tr><td style="font-size:11px;color:#44445a;text-align:center;line-height:1.6;">
          If you didn't request this, you can safely ignore this email.<br/>
          &copy; 2026 ADOFAI.NET
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const link = `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    `Verify your ${FROM_NAME} account`,
    emailTemplate(
      "Verify Your Email",
      `Welcome to ${FROM_NAME}!<br/><br/>Click the button below to verify your email address.<br/>This link expires in 24 hours.`,
      "Verify Email",
      link,
    ),
  );
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    `Reset your ${FROM_NAME} password`,
    emailTemplate(
      "Reset Your Password",
      `You requested a password reset for your ${FROM_NAME} account.<br/><br/>Click the button below to set a new password.<br/>This link expires in 1 hour.`,
      "Reset Password",
      link,
    ),
  );
}

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
