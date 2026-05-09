import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(1),
  turnstile:   z.string().optional(),
  honeypot:    z.string().optional(),
  formLoadedAt: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  // Rate limit: 3 login attempts per IP per 5 minutes, 1-hour block after
  if (!rateLimit(`login:${ip}`, 3, 5 * 60_000, 60 * 60_000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 30 minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, password, turnstile, honeypot, formLoadedAt } = schema.parse(body);

    // Honeypot check
    if (honeypot && honeypot.trim().length > 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Timing check — form must have been open at least 1 second
    if (formLoadedAt && Date.now() - formLoadedAt < 1000) {
      return NextResponse.json(
        { error: "Form submitted too quickly. Please try again." },
        { status: 400 }
      );
    }

    // Cloudflare Turnstile — required
    const turnstileOk = await verifyTurnstile(turnstile, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Human verification failed. Please complete the challenge." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true, username: true, email: true, passwordHash: true, role: true,
        emailVerified: true, emailVerifyToken: true, emailVerifyExpiry: true,
      },
    });
    if (!user) {
      await bcrypt.compare(password, "$2a$12$invalidhashforsecurityXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      if (!rateLimit(`login:user:${user.id}`, 3, 10 * 60_000, 2 * 60 * 60_000)) {
        return NextResponse.json(
          { error: "Account temporarily locked due to too many failed attempts." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED", email: user.email },
        { status: 403 }
      );
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    return setTokenCookie(response, token);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
