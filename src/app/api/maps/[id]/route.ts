import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const map = await db.map.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, username: true, avatar: true } },
        records: {
          orderBy: { accuracy: "desc" },
          take: 10,
          include: {
            user: { select: { id: true, username: true, avatar: true, country: true } },
          },
        },
      },
    });
    if (!map) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
