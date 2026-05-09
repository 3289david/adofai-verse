import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        map: {
          include: {
            creator: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });

    return NextResponse.json(bookmarks);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mapId } = await req.json();
    if (!mapId || typeof mapId !== "string") {
      return NextResponse.json({ error: "mapId is required" }, { status: 400 });
    }

    const existing = await db.bookmark.findUnique({
      where: { userId_mapId: { userId: user.id, mapId } },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await db.bookmark.create({ data: { userId: user.id, mapId } });
    return NextResponse.json({ bookmarked: true });
  } catch {
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
