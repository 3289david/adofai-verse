import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, getIp } from "@/lib/rate-limit";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getIp(req);

  // Rate limit: 10 edits per user per minute
  if (!rateLimit(`map-edit:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many edit requests. Please slow down." }, { status: 429 });
  }

  const { id } = await params;
  try {
    const map = await db.map.findUnique({ where: { id }, select: { creatorId: true } });
    if (!map) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = map.creatorId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "MODERATOR";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const {
      title, artist, difficulty, bpmMin, bpmMax,
      duration, tileCount, creatorName,
      description, videoUrl, downloadUrl, tags, coverImage, status,
      turnstile,
    } = body;

    // Turnstile verification for map edits
    const turnstileOk = await verifyTurnstile(turnstile as string | undefined, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Human verification failed. Please complete the Turnstile challenge." },
        { status: 400 }
      );
    }

    const updated = await db.map.update({
      where: { id },
      data: {
        ...(title       !== undefined && { title:       String(title).slice(0, 200) }),
        ...(artist      !== undefined && { artist:      String(artist).slice(0, 200) }),
        ...(difficulty  !== undefined && { difficulty:  Number(difficulty) }),
        ...(bpmMin      !== undefined && { bpmMin:      Number(bpmMin) }),
        ...(bpmMax      !== undefined && { bpmMax:      Number(bpmMax) }),
        ...(duration    !== undefined && { duration:    Math.max(0, Number(duration)) }),
        ...(tileCount   !== undefined && { tileCount:   Math.max(0, Number(tileCount)) }),
        ...(creatorName !== undefined && { creatorName: creatorName ? String(creatorName).slice(0, 200) : null }),
        ...(description !== undefined && { description: description ? String(description).slice(0, 1000) : null }),
        ...(videoUrl    !== undefined && { videoUrl:    videoUrl || null }),
        ...(downloadUrl !== undefined && { downloadUrl: downloadUrl || null }),
        ...(tags        !== undefined && { tags }),
        ...(coverImage  !== undefined && { coverImage:  coverImage || null }),
        // status can only be changed by admin/moderator
        ...(status !== undefined && isAdmin && { status }),
      },
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

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
