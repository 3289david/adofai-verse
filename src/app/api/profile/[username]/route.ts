import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  try {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, avatar: true, bio: true,
        country: true, role: true, createdAt: true,
        createdMaps: {
          where:   { status: { in: ["APPROVED", "FEATURED"] } },
          orderBy: { createdAt: "desc" },
          take:    12,
          select:  {
            id: true, title: true, artist: true, difficulty: true,
            coverImage: true, likeCount: true, playCount: true, status: true,
            bpmMin: true, bpmMax: true, tileCount: true,
          },
        },
        records: {
          orderBy: { accuracy: "desc" },
          take:    10,
          select:  {
            id: true, accuracy: true, cleared: true, score: true, xp: true, createdAt: true,
            map: { select: { id: true, title: true, artist: true, difficulty: true } },
          },
        },
        _count: { select: { records: true, createdMaps: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
