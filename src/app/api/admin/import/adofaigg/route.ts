import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1MOz5cmMpYwpBB95DK1Udcti_8eOrswnxWzFurhAz0yg/gviz/tq?tqx=out:json&gid=739034057";

// Korean adofai.gg tags → our English tag system
const TAG_MAP: Record<string, string> = {
  "#동시치기": "#precision",   // pseudo/chord hits
  "#2+동타":   "#precision",   // 3+ simultaneous
  "#셋잇단":   "#pattern",     // triplet
  "#다섯잇단": "#pattern",     // quintuplet
  "#일곱잇단": "#pattern",     // septuplet
  "#폴리리듬": "#pattern",     // polyrhythm
  "#스윙":     "#pattern",     // swing
  "#트레실로": "#pattern",     // tresillo
  "#개박":     "#pattern",     // funky beat
  "#64+비트":  "#speed",       // 64+ beat (very dense)
  "#변속":     "#technical",   // BPM acceleration
  "#질주":     "#stream",      // gallop / fast stream
  "#마법진":   "#technical",   // magic shape
  "#암기":     "#technical",   // memorization gimmick
  "#기믹":     "#technical",   // general gimmick
  "#급가속":   "#speed",       // sudden acceleration
  "#흰토끼":   "#beginner-friendly", // slow (white rabbit)
};

function getCellValue(c: { v?: unknown } | null | undefined) {
  return c && c.v != null ? c.v : null;
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the Google Sheets data
    const res = await fetch(SHEET_URL, { next: { revalidate: 0 } });
    const raw = await res.text();
    // Strip the JS visualization wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const jsonStr = raw
      .replace(/^\/\*.*?\*\/\s*google\.visualization\.Query\.setResponse\(/, "")
      .replace(/\);?\s*$/, "");
    const sheet = JSON.parse(jsonStr);
    const rows: Array<{ c: Array<{ v?: unknown } | null> }> = sheet.table.rows;

    // Find or create the system import user
    let botUser = await db.user.findFirst({ where: { username: "adofai-gg" } });
    if (!botUser) {
      botUser = await db.user.create({
        data: {
          username: "adofai-gg",
          email: "import@adofai.gg",
          passwordHash: "SYSTEM_IMPORT_ACCOUNT",
          role: "CREATOR",
        },
      });
    }

    // Parse all valid rows
    type MapInput = {
      title: string; artist: string; creatorId: string;
      difficulty: number; bpmMin: number; bpmMax: number;
      duration: number; tileCount: number;
      downloadUrl: string | null; description: string | null;
      tags: string[]; status: "APPROVED"; externalId: string;
    };

    const parsed: MapInput[] = [];
    for (const row of rows) {
      const c = row.c;
      const get = (i: number) => getCellValue(c[i]);

      const id         = get(0);
      const title      = get(1);
      const artist     = get(2);
      const difficulty = get(16); // numeric float difficulty (col 16)
      const bpm        = get(9);
      const tiles      = get(10);
      const downloadUrl = get(18) as string | null;
      const workshopUrl = get(19) as string | null;
      const creatorName = get(4) as string | null;

      // Skip rows without required fields or with invalid/negative difficulty
      if (!id || !title || difficulty == null || Number(difficulty) <= 0) continue;

      const rawTags = [get(11), get(12), get(13), get(14), get(15)]
        .filter(Boolean)
        .map(t => String(t));
      const tags = [...new Set(rawTags.map(t => TAG_MAP[t]).filter(Boolean))];

      const desc = [
        creatorName ? `Creator: ${creatorName}` : null,
        workshopUrl ? `Workshop: ${workshopUrl}` : null,
      ].filter(Boolean).join(" | ") || null;

      parsed.push({
        title:       String(title),
        artist:      String(artist ?? "Unknown"),
        creatorId:   botUser.id,
        difficulty:  Number(difficulty),
        bpmMin:      bpm ? Math.round(Number(bpm)) : 0,
        bpmMax:      bpm ? Math.round(Number(bpm)) : 0,
        duration:    0,
        tileCount:   tiles ? Math.round(Number(tiles)) : 0,
        downloadUrl: downloadUrl || null,
        description: desc,
        tags,
        status:      "APPROVED",
        externalId:  `adofaigg:${Math.round(Number(id))}`,
      });
    }

    // Determine which externalIds already exist
    const existing = new Set(
      (await db.map.findMany({
        where: { externalId: { startsWith: "adofaigg:" } },
        select: { externalId: true },
      })).map(m => m.externalId!)
    );

    const toCreate = parsed.filter(m => !existing.has(m.externalId));
    const toUpdate = parsed.filter(m => existing.has(m.externalId));

    // Bulk insert new maps
    const { count: imported } = toCreate.length > 0
      ? await db.map.createMany({ data: toCreate, skipDuplicates: true })
      : { count: 0 };

    // Update existing in chunks of 50
    const CHUNK = 50;
    for (let i = 0; i < toUpdate.length; i += CHUNK) {
      await Promise.all(
        toUpdate.slice(i, i + CHUNK).map(m =>
          db.map.update({ where: { externalId: m.externalId }, data: m })
        )
      );
    }

    return NextResponse.json({
      ok: true,
      total: parsed.length,
      imported,
      updated: toUpdate.length,
      skipped: rows.length - parsed.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
