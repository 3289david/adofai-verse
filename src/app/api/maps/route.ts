import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search  = searchParams.get("search") ?? "";
  const diffMin = Number(searchParams.get("diffMin") ?? 0);
  const diffMax = Number(searchParams.get("diffMax") ?? 99);
  const tags    = searchParams.getAll("tags");
  const sort    = searchParams.get("sort") ?? "popular";
  const page    = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit   = Math.min(Number(searchParams.get("limit") ?? 24), 100);

  try {
    const orderBy =
      sort === "newest"          ? { createdAt: "desc" as const }   :
      sort === "difficulty_asc"  ? { difficulty: "asc"  as const }  :
      sort === "difficulty_desc" ? { difficulty: "desc" as const }  :
      sort === "bpm"             ? { bpmMax: "desc" as const }      :
                                   { playCount: "desc" as const };

    const where = {
      status: { in: ["APPROVED", "FEATURED"] as ("APPROVED" | "FEATURED")[] },
      difficulty: { gte: diffMin, lte: diffMax },
      ...(search && {
        OR: [
          { title:   { contains: search, mode: "insensitive" as const } },
          { artist:  { contains: search, mode: "insensitive" as const } },
          { creator: { username: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
      ...(tags.length && { tags: { hasEvery: tags } }),
    };

    const [maps, total] = await Promise.all([
      db.map.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { creator: { select: { id: true, username: true, avatar: true } } },
      }),
      db.map.count({ where }),
    ]);

    return NextResponse.json({ maps, total, page, limit });
  } catch {
    return NextResponse.json({ maps: [], total: 0, page: 1, limit });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const map  = await db.map.create({
      data: {
        title: body.title, artist: body.artist, creatorId: body.creatorId,
        difficulty: body.difficulty, bpmMin: body.bpmMin, bpmMax: body.bpmMax,
        duration: body.duration, tileCount: body.tileCount,
        coverImage: body.coverImage, downloadUrl: body.downloadUrl,
        description: body.description, tags: body.tags ?? [], bpmData: body.bpmData,
      },
      include: { creator: { select: { id: true, username: true, avatar: true } } },
    });
    return NextResponse.json(map, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create map" }, { status: 500 });
  }
}
