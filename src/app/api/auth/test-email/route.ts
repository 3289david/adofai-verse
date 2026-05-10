import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";

/**
 * Debug-only endpoint: send a test email via Resend.
 * Admin-only. Use it to verify that RESEND_API_KEY and RESEND_FROM are wired correctly.
 *
 *   curl -X POST https://adofai.net/api/auth/test-email \
 *     -H "Cookie: auth_token=..." \
 *     -H "Content-Type: application/json" \
 *     -d '{"to":"you@example.com"}'
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { to } = (await req.json()) as { to?: string };
  if (!to) return NextResponse.json({ error: "Missing 'to' field" }, { status: 400 });

  const result = await sendEmail(
    to,
    "ADOFAI.NET — Resend Test",
    `<p>This is a test email from <strong>ADOFAI.NET</strong>.</p>
     <p>If you received this, Resend is configured correctly.</p>
     <p>Sent at: ${new Date().toISOString()}</p>`,
  );

  return NextResponse.json({
    apiKeySet:    !!process.env.RESEND_API_KEY,
    fromAddress:  process.env.RESEND_FROM ?? "onboarding@resend.dev (default)",
    appUrl:       process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
    result,
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  return NextResponse.json({
    apiKeySet:   !!process.env.RESEND_API_KEY,
    apiKeyHint:  process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 6)}...` : null,
    fromAddress: process.env.RESEND_FROM ?? "onboarding@resend.dev (default)",
    appUrl:      process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
  });
}
