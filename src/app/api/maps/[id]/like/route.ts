import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ liked: false, likeCount: 0 });
  const { id } = await params;
  try {
    const [existing, map] = await Promise.all([
      db.mapLike.findUnique({ where: { userId_mapId: { userId: user.id, mapId: id } } }),
      db.map.findUnique({ where: { id }, select: { likeCount: true } }),
    ]);
    return NextResponse.json({ liked: !!existing, likeCount: map?.likeCount ?? 0 });
  } catch {
    return NextResponse.json({ liked: false, likeCount: 0 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const existing = await db.mapLike.findUnique({
      where: { userId_mapId: { userId: user.id, mapId: id } },
    });

    if (existing) {
      await db.mapLike.delete({ where: { id: existing.id } });
      const map = await db.map.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
      return NextResponse.json({ liked: false, likeCount: Math.max(0, map.likeCount) });
    } else {
      await db.mapLike.create({ data: { userId: user.id, mapId: id } });
      const map = await db.map.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });
      return NextResponse.json({ liked: true, likeCount: map.likeCount });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
