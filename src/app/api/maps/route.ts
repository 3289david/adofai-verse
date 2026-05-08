import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title, artist, difficulty, bpmMin, bpmMax,
      duration, tileCount, coverImage, downloadUrl,
      description, tags, bpmData, videoUrl,
    } = body;

    if (!title || !artist) {
      return NextResponse.json({ error: "title and artist are required" }, { status: 400 });
    }

    const isPrivileged = user.role === "ADMIN" || user.role === "MODERATOR";
    const status = isPrivileged ? "APPROVED" : "PENDING";

    const map = await db.map.create({
      data: {
        title,
        artist,
        creatorId:   user.id,
        difficulty:  Number(difficulty ?? 0),
        bpmMin:      Number(bpmMin ?? 0),
        bpmMax:      Number(bpmMax ?? 0),
        duration:    Number(duration ?? 0),
        tileCount:   Number(tileCount ?? 0),
        coverImage:  coverImage ?? null,
        downloadUrl: downloadUrl ?? null,
        description: description ?? null,
        videoUrl:    videoUrl ?? null,
        tags:        tags ?? [],
        bpmData:     bpmData ?? null,
        status,
      },
      include: { creator: { select: { id: true, username: true, avatar: true } } },
    });
    return NextResponse.json(map, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
