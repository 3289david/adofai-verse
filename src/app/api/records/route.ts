import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getXpForDifficulty } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { mapId, accuracy, cleared, score, note } = await req.json();

    if (!mapId) return NextResponse.json({ error: "mapId is required" }, { status: 400 });
    if (accuracy == null || accuracy < 0 || accuracy > 100) {
      return NextResponse.json({ error: "Accuracy must be between 0 and 100" }, { status: 400 });
    }

    const map = await db.map.findUnique({ where: { id: mapId }, select: { difficulty: true } });
    if (!map) return NextResponse.json({ error: "Map not found" }, { status: 404 });

    const xp = getXpForDifficulty(map.difficulty, accuracy);

    const record = await db.record.upsert({
      where: { userId_mapId: { userId: user.id, mapId } },
      create: {
        userId:   user.id,
        mapId,
        accuracy: Number(accuracy),
        cleared:  !!cleared,
        score:    score ?? 0,
        xp,
        note:     note ?? null,
        attempts: 1,
      },
      update: {
        accuracy: Number(accuracy),
        cleared:  !!cleared,
        score:    score ?? 0,
        xp,
        note:     note ?? null,
        attempts: { increment: 1 },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
