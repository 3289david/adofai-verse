import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth";
import { appOrigin, authIssuer, oauthClientId } from "@/lib/oauth-app";

const COOKIE_VER = "oa_pkce_ver";
const COOKIE_ST = "oa_pkce_state";
const COOKIE_NEXT = "oa_next";

function fail(req: NextRequest, msg: string) {
  const u = new URL("/login", req.url);
  u.searchParams.set("oauth_err", msg.slice(0, 200));
  return NextResponse.redirect(u);
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) return fail(req, oauthError);

  const jar = req.cookies;
  const verifier = jar.get(COOKIE_VER)?.value;
  const savedState = jar.get(COOKIE_ST)?.value;
  let nextPath = jar.get(COOKIE_NEXT)?.value ?? "/";

  if (!code || !state || !verifier || !savedState || state !== savedState) {
    return fail(req, "invalid_oauth_session");
  }
  if (!nextPath.startsWith("/")) nextPath = "/";

  const issuer = authIssuer();
  const redirectUri = `${appOrigin()}/api/auth/oauth/callback`;

  const tokenRes = await fetch(`${issuer}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: oauthClientId(),
      code_verifier: verifier,
    }).toString(),
  });

  if (!tokenRes.ok) {
    return fail(req, "token_exchange_failed");
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const access = tokenJson.access_token;
  if (!access) return fail(req, "no_access_token");

  const uiRes = await fetch(`${issuer}/api/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!uiRes.ok) return fail(req, "userinfo_failed");

  const profile = (await uiRes.json()) as { sub?: string };

  try {
    const user = await db.user.findUnique({
      where: { id: profile.sub ?? "" },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) return fail(req, "unknown_user_share_db_required");

    const jwt = await signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.redirect(new URL(nextPath, req.url));
    res.cookies.set(COOKIE_VER, "", { path: "/", maxAge: 0 });
    res.cookies.set(COOKIE_ST, "", { path: "/", maxAge: 0 });
    res.cookies.set(COOKIE_NEXT, "", { path: "/", maxAge: 0 });
    return setTokenCookie(res, jwt);
  } catch {
    return fail(req, "login_failed");
  }
}
