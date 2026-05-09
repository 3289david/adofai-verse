import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  if (!rateLimit(`resend:${ip}`, 2, 5 * 60_000, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({ sent: true });
    }

    const emailVerifyToken = randomBytes(32).toString("hex");
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60_000);

    await db.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry },
    });

    await sendVerificationEmail(user.email, emailVerifyToken);

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Failed to resend." }, { status: 500 });
  }
}
