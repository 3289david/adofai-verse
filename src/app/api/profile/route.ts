import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { bio, country, avatar } = await req.json();
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(bio     !== undefined && { bio:     bio ? String(bio).slice(0, 500) : null }),
        ...(country !== undefined && { country: country || null }),
        ...(avatar  !== undefined && { avatar:  avatar  || null }),
      },
      select: { id: true, username: true, avatar: true, bio: true, country: true, role: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
