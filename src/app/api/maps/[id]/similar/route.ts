import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const current = await db.map.findUnique({
      where: { id },
      select: { difficulty: true, tags: true },
    });
    if (!current) {
      return NextResponse.json([], { status: 200 });
    }

    const diffMin = current.difficulty - 3;
    const diffMax = current.difficulty + 3;

    const candidates = await db.map.findMany({
      where: {
        id: { not: id },
        difficulty: { gte: diffMin, lte: diffMax },
        status: { in: ["APPROVED", "FEATURED"] },
      },
      select: {
        id: true,
        title: true,
        artist: true,
        difficulty: true,
        coverImage: true,
        videoUrl: true,
        tags: true,
        likeCount: true,
        playCount: true,
        bpmMin: true,
        bpmMax: true,
        creator: { select: { id: true, username: true, avatar: true } },
      },
      take: 30,
    });

    // Sort by number of overlapping tags descending, then shuffle ties
    const currentTags = new Set(current.tags);
    const scored = candidates.map(m => ({
      ...m,
      _tagOverlap: m.tags.filter(t => currentTags.has(t)).length,
      _rand: Math.random(),
    }));
    scored.sort((a, b) => b._tagOverlap - a._tagOverlap || a._rand - b._rand);

    const result = scored.slice(0, 6).map(({ _tagOverlap, _rand, ...m }) => m);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
