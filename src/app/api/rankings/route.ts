import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 50), 100);
  try {
    const users = await db.user.findMany({
      take: limit,
      include: {
        records: { where: { cleared: true }, select: { accuracy: true, xp: true } },
      },
    });

    const rankings = users
      .map(u => ({
        user: { id: u.id, username: u.username, avatar: u.avatar, country: u.country },
        totalXp:      u.records.reduce((s, r) => s + r.xp, 0),
        mapsCleared:  u.records.length,
        avgAccuracy:  u.records.length ? u.records.reduce((s, r) => s + r.accuracy, 0) / u.records.length : 0,
        topAccuracy:  u.records.length ? Math.max(...u.records.map(r => r.accuracy)) : 0,
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return NextResponse.json({ rankings });
  } catch {
    return NextResponse.json({ rankings: [] });
  }
}
