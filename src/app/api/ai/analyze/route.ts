import { NextRequest, NextResponse } from "next/server";
import { analyzeMap } from "@/lib/pollinations";
import type { MapData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { map } = (await req.json()) as { map: MapData };

    if (!map || !map.title) {
      return NextResponse.json({ error: "Map data required" }, { status: 400 });
    }

    const result = await analyzeMap(map);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI analyze error:", err);
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
