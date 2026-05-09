import { NextRequest, NextResponse } from "next/server";
import { createPoWChallenge } from "@/lib/pow";
import { rateLimit, getIp } from "@/lib/rate-limit";

/**
 * GET /api/auth/pow
 * Returns a signed Proof-of-Work challenge for the client to solve.
 * Rate-limited to prevent challenge farming.
 */
export async function GET(req: NextRequest) {
  const ip = getIp(req);

  if (!rateLimit(`pow:${ip}`, 8, 60_000, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { challenge, difficulty, token } = createPoWChallenge();
  return NextResponse.json({ challenge, difficulty, token });
}
