/** OAuth / IdP config for this Next.js site (RK: ADOFAI.VERSE). */

export function authIssuer(): string {
  const u = process.env.NEXT_PUBLIC_AUTH_ISSUER ?? process.env.OAUTH_ISSUER ?? "";
  return u.replace(/\/$/, "");
}

export function authFallbackIssuer(): string {
  const u = process.env.OAUTH_FALLBACK_ISSUER ?? "";
  return u.replace(/\/$/, "");
}

export function oauthClientId(): string {
  return process.env.OAUTH_CLIENT_ID ?? "adofai_verse_web";
}

export function appOrigin(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return u.replace(/\/$/, "");
}

/**
 * Returns the issuer that is currently reachable.
 * Tries the primary (auth.adofai.net) first; falls back to OAUTH_FALLBACK_ISSUER
 * (adofai-auth.boxd.sh) if the primary is unreachable.
 */
export async function resolveIssuer(): Promise<string> {
  const primary = authIssuer();
  const fallback = authFallbackIssuer();

  if (!primary) return fallback;

  try {
    const res = await fetch(`${primary}/.well-known/oauth-authorization-server`, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return primary;
  } catch {
    // primary unreachable
  }

  return fallback || primary;
}
