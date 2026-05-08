import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_MAPS } from "@/lib/mock-data";

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
        _count: { select: { records: true, likes: true } },
      },
    });

    if (!map) {
      const mock = MOCK_MAPS.find((m) => m.id === id);
      if (mock) return NextResponse.json(mock);
      return NextResponse.json({ error: "Map not found" }, { status: 404 });
    }

    return NextResponse.json(map);
  } catch {
    const mock = MOCK_MAPS.find((m) => m.id === id);
    if (mock) return NextResponse.json(mock);
    return NextResponse.json({ error: "Map not found" }, { status: 404 });
  }
}
