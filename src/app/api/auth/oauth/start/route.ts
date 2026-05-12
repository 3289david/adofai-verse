import { NextRequest, NextResponse } from "next/server";
import { randomVerifier, randomState, s256Challenge } from "@/lib/oauth-pkce";
import { appOrigin, authIssuer, oauthClientId } from "@/lib/oauth-app";

const COOKIE_VER = "oa_pkce_ver";
const COOKIE_ST = "oa_pkce_state";
const COOKIE_NEXT = "oa_next";

const TTL = 60 * 10;

export async function GET(req: NextRequest) {
  const issuer = authIssuer();
  if (!issuer) {
    return NextResponse.json({ error: "NEXT_PUBLIC_AUTH_ISSUER / OAUTH_ISSUER is not configured" }, { status: 500 });
  }

  let nextPath = req.nextUrl.searchParams.get("next") ?? "/";
  if (!nextPath.startsWith("/")) nextPath = "/";

  const verifier = randomVerifier();
  const state = randomState();
  const challenge = s256Challenge(verifier);

  const redirectUri = `${appOrigin()}/api/auth/oauth/callback`;

  const q = new URLSearchParams({
    response_type: "code",
    client_id: oauthClientId(),
    redirect_uri: redirectUri,
    scope: "openid profile email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const dest = `${issuer}/oauth/authorize?${q.toString()}`;
  const res = NextResponse.redirect(dest);

  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TTL,
  };
  res.cookies.set(COOKIE_VER, verifier, opts);
  res.cookies.set(COOKIE_ST, state, opts);
  res.cookies.set(COOKIE_NEXT, nextPath, opts);
  return res;
}
