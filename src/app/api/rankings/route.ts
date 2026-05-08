import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_RANKINGS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  try {
    const users = await db.user.findMany({
      take: limit,
      include: {
        records: {
          where: { cleared: true },
          select: { accuracy: true, xp: true },
        },
        _count: { select: { records: true } },
      },
    });

    const rankings = users
      .map((user) => ({
        rank: 0,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          country: user.country,
        },
        totalXp: user.records.reduce((sum, r) => sum + r.xp, 0),
        mapsCleared: user.records.length,
        avgAccuracy:
          user.records.length > 0
            ? user.records.reduce((sum, r) => sum + r.accuracy, 0) / user.records.length
            : 0,
        topAccuracy: user.records.length > 0 ? Math.max(...user.records.map((r) => r.accuracy)) : 0,
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return NextResponse.json({ rankings });
  } catch {
    return NextResponse.json({ rankings: MOCK_RANKINGS });
  }
}
