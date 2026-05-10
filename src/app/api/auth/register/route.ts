import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sendVerificationEmail, isDisposableEmail } from "@/lib/email";

const schema = z.object({
  username:    z.string().min(3).max(20).regex(/^[-a-zA-Z0-9_]+$/),
  email:       z.string().email().max(254),
  password:    z.string().min(8).max(128),
  turnstile:   z.string().optional(),
  honeypot:    z.string().optional(),
  formLoadedAt: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  if (!rateLimit(`register:${ip}`, 2, 30 * 60_000, 24 * 60 * 60_000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const { username, email, password, turnstile, honeypot, formLoadedAt } = parsed;

    if (honeypot && honeypot.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    if (formLoadedAt && Date.now() - formLoadedAt < 1500) {
      return NextResponse.json(
        { error: "Form submitted too quickly. Please try again." },
        { status: 400 }
      );
    }

    const turnstileOk = await verifyTurnstile(turnstile, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Human verification failed. Please complete the challenge." },
        { status: 400 }
      );
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Disposable or temporary email addresses are not allowed." },
        { status: 400 }
      );
    }

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
    const emailVerifyToken = randomBytes(32).toString("hex");
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60_000);

    await db.user.create({
      data: { username, email, passwordHash, emailVerifyToken, emailVerifyExpiry, emailVerified: false },
      select: { id: true },
    });

    const result = await sendVerificationEmail(email, emailVerifyToken);
    if (!result.ok) {
      console.error("[register] email send failed:", result.error);
    }

    return NextResponse.json(
      { ok: true, email, emailSent: result.ok, emailError: result.ok ? undefined : result.error },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
