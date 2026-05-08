import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [maps, players, records] = await Promise.all([
      db.map.count({ where: { status: { in: ["APPROVED", "FEATURED"] } } }),
      db.user.count(),
      db.record.count(),
    ]);
    return NextResponse.json({ maps, players, records });
  } catch {
    return NextResponse.json({ maps: 0, players: 0, records: 0 });
  }
}
