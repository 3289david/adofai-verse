import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { verifyPoWSolution } from "@/lib/pow";
import { rateLimit, getIp } from "@/lib/rate-limit";

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(1),
  // anti-spam fields
  turnstile:   z.string().optional(),
  powToken:    z.string().optional(),
  powNonce:    z.string().optional(),
  honeypot:    z.string().optional(),
  formLoadedAt: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  // Rate limit: 5 login attempts per IP per 5 minutes, 30-minute block after
  if (!rateLimit(`login:${ip}`, 5, 5 * 60_000, 30 * 60_000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 30 minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, password, turnstile, powToken, powNonce, honeypot, formLoadedAt } = schema.parse(body);

    // Honeypot check
    if (honeypot && honeypot.trim().length > 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Timing check
    if (formLoadedAt && Date.now() - formLoadedAt < 1000) {
      return NextResponse.json(
        { error: "Form submitted too quickly. Please try again." },
        { status: 400 }
      );
    }

    // Turnstile verification
    const turnstileOk = await verifyTurnstile(turnstile, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Human verification failed. Please complete the challenge." },
        { status: 400 }
      );
    }

    // Proof-of-Work verification (optional bonus layer — required only when provided)
    if (powToken && powNonce && !verifyPoWSolution(powToken, powNonce)) {
      return NextResponse.json(
        { error: "Security check failed. Please reload and try again." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Constant-time fake compare to prevent timing attacks on email enumeration
      await bcrypt.compare(password, "$2a$12$invalidhashforsecurityXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      // Per-user rate limit on failed attempts
      if (!rateLimit(`login:user:${user.id}`, 5, 15 * 60_000, 60 * 60_000)) {
        return NextResponse.json(
          { error: "Account temporarily locked due to too many failed attempts." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
      emailVerified: user.emailVerified,
    });
    return setTokenCookie(response, token);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
