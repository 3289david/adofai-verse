import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AuthUser } from "./types";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

export const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ id: user.id, username: user.username, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

// Read the current user from the httpOnly cookie (server components + API routes)
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Set the auth cookie directly on a NextResponse (Route Handlers)
export function setTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return response;
}

// Clear the auth cookie on a NextResponse (Route Handlers)
export function clearTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
