/** OAuth / IdP config for this Next.js site (RK: ADOFAI.VERSE). */

export function authIssuer(): string {
  const u = process.env.NEXT_PUBLIC_AUTH_ISSUER ?? process.env.OAUTH_ISSUER ?? "";
  return u.replace(/\/$/, "");
}

export function oauthClientId(): string {
  return process.env.OAUTH_CLIENT_ID ?? "adofai_verse_web";
}

export function appOrigin(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return u.replace(/\/$/, "");
}
