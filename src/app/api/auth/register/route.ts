import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { verifyPoWSolution } from "@/lib/pow";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sendVerificationEmail, isDisposableEmail } from "@/lib/email";

const schema = z.object({
  username:    z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  email:       z.string().email().max(254),
  password:    z.string().min(8).max(128),
  // anti-spam fields
  turnstile:   z.string().optional(),
  powToken:    z.string().optional(),
  powNonce:    z.string().optional(),
  honeypot:    z.string().optional(), // must be empty
  formLoadedAt: z.number().optional(), // timestamp ms
});

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  // Rate limit: 2 registrations per IP per 30 minutes, blocked for 24 hours on abuse
  if (!rateLimit(`register:${ip}`, 2, 30 * 60_000, 24 * 60 * 60_000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const { username, email, password, turnstile, powToken, powNonce, honeypot, formLoadedAt } = parsed;

    // Honeypot: bots fill hidden fields, humans don't
    if (honeypot && honeypot.trim().length > 0) {
      // Silently fail — don't reveal honeypot detection
      return NextResponse.json({ id: "ok" }, { status: 201 });
    }

    // Timing check — form must have been open at least 1.5 seconds
    if (formLoadedAt && Date.now() - formLoadedAt < 1500) {
      return NextResponse.json(
        { error: "Form submitted too quickly. Please try again." },
        { status: 400 }
      );
    }

    // Cloudflare Turnstile verification
    const turnstileOk = await verifyTurnstile(turnstile, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Human verification failed. Please complete the challenge." },
        { status: 400 }
      );
    }

    // Proof-of-Work — required
    if (!verifyPoWSolution(powToken, powNonce)) {
      return NextResponse.json(
        { error: "Security check failed. Please wait for the check to complete and try again." },
        { status: 400 }
      );
    }

    // Disposable email check
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Disposable or temporary email addresses are not allowed." },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "Email already in use" : "Username already taken" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerifyToken = randomBytes(32).toString("hex");
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60_000); // 24 hours

    // Try creating with email-verification fields; fall back to base fields if the DB
    // columns don't exist yet (i.e. db:push hasn't been run on the server after the
    // schema change — this keeps registration working during rolling deploys).
    let user: { id: string; username: string; email: string; role: string };
    try {
      user = await db.user.create({
        data: { username, email, passwordHash, emailVerifyToken, emailVerifyExpiry, emailVerified: false },
        select: { id: true, username: true, email: true, role: true },
      });
      // Send verification email (best-effort; exe.dev gateway may limit recipients)
      await sendVerificationEmail(email, emailVerifyToken).catch(() => {});
    } catch {
      // Columns not yet in DB — create without them (emailVerified defaults to false in schema)
      user = await db.user.create({
        data: { username, email, passwordHash },
        select: { id: true, username: true, email: true, role: true },
      });
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: false,
      },
      { status: 201 }
    );
    return setTokenCookie(response, token);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
