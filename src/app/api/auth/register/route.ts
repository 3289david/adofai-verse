import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = schema.parse(body);

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
    const user = await db.user.create({
      data: { username, email, passwordHash },
    });

    const token = await signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      { status: 201 }
    );
    return setTokenCookie(response, token);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
