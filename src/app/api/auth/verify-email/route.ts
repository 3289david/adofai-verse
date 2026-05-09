import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/auth/verify-email?token=...
 * Verifies a user's email address via the token sent in the verification email.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new Response(renderPage("Invalid Link", "No verification token provided.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const user = await db.user.findFirst({
      where: { emailVerifyToken: token, emailVerifyExpiry: { gt: new Date() } },
    });

    if (!user) {
      return new Response(
        renderPage("Link Expired", "This verification link is invalid or has expired. Please register again or request a new link.", false),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
    });

    return new Response(
      renderPage("Email Verified!", "Your email has been verified. You can now log in to ADOFAI.NET.", true),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new Response(
      renderPage("Error", "Something went wrong. Please try again.", false),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function renderPage(title: string, message: string, success: boolean): string {
  const color = success ? "#44dd88" : "#ff2244";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ADOFAI.NET</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #07070f; color: #f0f0ff; font-family: system-ui, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: rgba(16,16,30,0.9); border: 1px solid rgba(26,26,53,0.8);
            border-radius: 1rem; padding: 2.5rem; max-width: 420px; width: 90%; text-align: center; }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 900; margin-bottom: .75rem; color: ${color}; }
    p { font-size: .9rem; color: #7777aa; line-height: 1.6; margin-bottom: 1.5rem; }
    a { display: inline-block; padding: .75rem 2rem; border-radius: .75rem; font-weight: 700;
        font-size: .875rem; text-decoration: none; color: white;
        background: linear-gradient(135deg, #ff2244, #ff8800); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/login">Go to Login</a>
  </div>
</body>
</html>`;
}
