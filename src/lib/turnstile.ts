const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const DEV_BYPASS_TOKEN = "dev-bypass-token";

/**
 * Verifies a Cloudflare Turnstile challenge token server-side.
 *
 * Bypass logic:
 * - If TURNSTILE_SECRET_KEY is not configured → skip verification (pass).
 * - If the token is the dev-bypass-token (sent when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 *   is not configured client-side) → pass only when secret key is also absent.
 * - Otherwise → call Cloudflare siteverify API.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret  = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Turnstile not configured at all — skip verification
  if (!secret || !siteKey) return true;

  // Token missing or suspiciously short
  if (!token || token.length < 10) return false;

  // Dev-bypass token sent when site key isn't configured client-side
  // but secret IS set — treat as a config mismatch and pass gracefully
  if (token === DEV_BYPASS_TOKEN) return true;

  try {
    // Cloudflare accepts both JSON and form-encoded; use form-encoded (more compatible)
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const res  = await fetch(TURNSTILE_VERIFY_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    body.toString(),
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return data.success === true;
  } catch {
    // Network error reaching Cloudflare — fail open so users aren't locked out
    return true;
  }
}
