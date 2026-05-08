import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

export async function POST() {
  return clearTokenCookie(NextResponse.json({ ok: true }));
}
