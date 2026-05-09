import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const ADOFAI_APPID = 977950;
const STEAM_API  = "https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/";
const PER_PAGE   = 100;
const MAX_PAGES  = 50; // up to 5,000 maps per import run

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read body ONCE — stream can only be consumed once
  let bodyKey = "";
  try {
    const body = await req.json();
    bodyKey = body?.steamKey ?? "";
  } catch { /* body may be empty */ }

  const apiKey = (process.env.STEAM_API_KEY || bodyKey || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Steam API key provided. Get a free key at steamcommunity.com/dev/apikey" },
      { status: 400 }
    );
  }

  // Pre-flight: verify DB schema has required columns before doing any work
  try {
    await db.map.findFirst({
      select: { externalId: true, workshopUrl: true, creatorName: true, videoUrl: true },
      take: 1,
    });
  } catch (schemaErr) {
    return NextResponse.json({
      error:
        "Database schema is missing required columns. " +
        "Run `npm run db:push` on the server, then try again.\n\n" +
        String(schemaErr),
    }, { status: 500 });
  }

  try {
    // Find or create the steam import bot
    let botUser = await db.user.findFirst({ where: { username: "steam-workshop" } });
    if (!botUser) {
      botUser = await db.user.create({
        data: {
          username:     "steam-workshop",
          email:        "import@steamworkshop.local",
          passwordHash: "SYSTEM_IMPORT_ACCOUNT",
          role:         "CREATOR",
        },
      });
    }

    // Fetch existing steam IDs to avoid duplicate inserts
    const existing = new Set(
      (await db.map.findMany({
        where:  { externalId: { startsWith: "steam:" } },
        select: { externalId: true },
      })).map(m => m.externalId!)
    );

    type MapInput = {
      title: string; artist: string; creatorId: string; creatorName: string | null;
      difficulty: number; bpmMin: number; bpmMax: number;
      duration: number; tileCount: number;
      coverImage: string | null; downloadUrl: string | null;
      workshopUrl: string | null; description: string | null;
      tags: string[]; status: "APPROVED"; playCount: number; externalId: string;
    };

    const allMaps: MapInput[] = [];
    let page  = 1;
    let total = Infinity;

    while (allMaps.length < total && page <= MAX_PAGES) {
      const url = new URL(STEAM_API);
      url.searchParams.set("key",             apiKey);
      url.searchParams.set("query_type",      "1");  // newest
      url.searchParams.set("page",            String(page));
      url.searchParams.set("numperpage",      String(PER_PAGE));
      url.searchParams.set("appid",           String(ADOFAI_APPID));
      url.searchParams.set("return_metadata", "true");
      url.searchParams.set("return_tags",     "true");
      url.searchParams.set("return_previews", "true");
      url.searchParams.set("format",          "json");

      const res = await fetch(url.toString());

      // Steam returns HTML for auth errors / rate limits — handle before .json()
      if (!res.ok) {
        const text = await res.text();
        if (text.trim().startsWith("<")) {
          throw new Error(
            `Steam API returned HTTP ${res.status}. ` +
            (res.status === 403 ? "API key is invalid or not authorized." :
             res.status === 429 ? "Rate limited — wait a minute and try again." :
             "Check your API key at steamcommunity.com/dev/apikey")
          );
        }
        throw new Error(`Steam API error ${res.status}: ${text.slice(0, 300)}`);
      }

      // Guard against unexpected HTML 200 responses (some Steam errors return 200 + HTML)
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("json")) {
        const text = await res.text();
        throw new Error(
          `Steam API returned non-JSON response (${contentType}). ` +
          "Your API key may be invalid. Check steamcommunity.com/dev/apikey\n" +
          `Preview: ${text.slice(0, 150)}`
        );
      }

      const data = await res.json();

      if (!data.response?.publishedfiledetails?.length) break;

      total = data.response.total ?? total;
      const items: SteamFile[] = data.response.publishedfiledetails;

      for (const item of items) {
        if (!item.publishedfileid || !item.title) continue;

        const workshopLink = `https://steamcommunity.com/sharedfiles/filedetails/?id=${item.publishedfileid}`;
        const meta = parseMetaFromSteam(item.title, item.description ?? "");
        const tagDiff = extractDifficulty(item.tags ?? []);
        allMaps.push({
          title:       meta.songTitle || item.title,
          artist:      meta.artist || "Unknown",
          creatorId:   botUser.id,
          creatorName: meta.artist || null,
          difficulty:  tagDiff > 0 ? tagDiff : meta.difficulty,
          bpmMin:      meta.bpmMin,
          bpmMax:      meta.bpmMax,
          duration:    0,
          tileCount:   meta.tileCount,
          coverImage:  item.preview_url ?? null,
          downloadUrl: workshopLink,
          workshopUrl: workshopLink,
          description: item.description ? item.description.slice(0, 500) : null,
          tags:        parseSteamTags(item.tags ?? []),
          status:      "APPROVED",
          playCount:   item.subscriptions ?? 0,
          externalId:  `steam:${item.publishedfileid}`,
        });
      }

      if (items.length < PER_PAGE) break;
      page++;
    }

    const toCreate = allMaps.filter(m => !existing.has(m.externalId));
    const toUpdate = allMaps.filter(m =>  existing.has(m.externalId));

    const { count: imported } = toCreate.length > 0
      ? await db.map.createMany({ data: toCreate, skipDuplicates: true })
      : { count: 0 };

    const CHUNK = 50;
    for (let i = 0; i < toUpdate.length; i += CHUNK) {
      await Promise.all(
        toUpdate.slice(i, i + CHUNK).map(m =>
          db.map.update({ where: { externalId: m.externalId }, data: m })
        )
      );
    }

    return NextResponse.json({
      ok:      true,
      total:   allMaps.length,
      imported,
      updated: toUpdate.length,
      pages:   page - 1,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const hint =
      msg.includes("Unknown field") || msg.includes("column") || msg.includes("externalId")
        ? " — Run `npm run db:push` on the server to apply missing schema columns."
        : msg.includes("ECONNREFUSED") || msg.includes("connect")
        ? " — Cannot reach the database. Check DATABASE_URL."
        : "";
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}

interface SteamFile {
  publishedfileid: string;
  title?:          string;
  description?:    string;
  preview_url?:    string;
  subscriptions?:  number;
  tags?:           { tag: string }[];
}

function parseMetaFromSteam(
  rawTitle: string,
  description: string
): { songTitle: string; artist: string; bpmMin: number; bpmMax: number; difficulty: number; tileCount: number } {
  // Extract artist from "Artist - Song Name" pattern
  let songTitle = rawTitle.trim();
  let artist = "";
  const dashMatch = rawTitle.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    artist    = dashMatch[1].trim();
    songTitle = dashMatch[2].trim();
  }

  const desc = (description || "").replace(/\[\/?\w+\]/g, " "); // strip BBCode

  // BPM: "180~200 BPM", "BPM: 180-200", "200BPM", "BPM 200"
  let bpmMin = 0, bpmMax = 0;
  const bpmRange  = desc.match(/(\d+)\s*[~-]\s*(\d+)\s*bpm/i) ?? desc.match(/bpm[:\s]*(\d+)\s*[~-]\s*(\d+)/i);
  const bpmSingle = desc.match(/\b(\d{2,4})\s*bpm\b/i) ?? desc.match(/\bbpm[:\s]+(\d{2,4})\b/i);
  if (bpmRange) {
    bpmMin = Math.min(parseInt(bpmRange[1]), parseInt(bpmRange[2]));
    bpmMax = Math.max(parseInt(bpmRange[1]), parseInt(bpmRange[2]));
  } else if (bpmSingle) {
    const v = parseInt(bpmSingle[1]);
    if (v >= 40 && v <= 9999) { bpmMin = v; bpmMax = v; }
  }

  // Difficulty
  let difficulty = 0;
  const diffMatch = desc.match(/(?:difficulty|diff|level|lv)[:\s.]*(\d+(?:\.\d+)?)/i)
                 ?? rawTitle.match(/\[(?:lv|level|diff(?:iculty)?)[.:\s]*(\d+(?:\.\d+)?)\]/i);
  if (diffMatch) {
    const d = parseFloat(diffMatch[1]);
    if (d > 0 && d <= 99) difficulty = Math.min(d, 21);
  }

  // Tile count
  let tileCount = 0;
  const tileMatch = desc.match(/(\d+)\s*tile/i) ?? desc.match(/tile[s\s]*[:\s]*(\d+)/i);
  if (tileMatch) tileCount = parseInt(tileMatch[1]);

  return { songTitle, artist, bpmMin, bpmMax, difficulty, tileCount };
}

function parseSteamTags(tags: { tag: string }[]): string[] {
  const result = new Set<string>();
  for (const { tag } of tags) {
    const t = tag.toLowerCase();
    if (t.includes("wave"))      result.add("#wave");
    if (t.includes("spam"))      result.add("#spam");
    if (t.includes("precision")) result.add("#precision");
    if (t.includes("speed"))     result.add("#speed");
    if (t.includes("pattern"))   result.add("#pattern");
    if (t.includes("stream"))    result.add("#stream");
    if (t.includes("technical")) result.add("#technical");
    if (t.includes("beginner"))  result.add("#beginner-friendly");
  }
  return [...result];
}

function extractDifficulty(tags: { tag: string }[]): number {
  for (const { tag } of tags) {
    const m = tag.match(/difficulty[:\s]+([\d.]+)/i);
    if (m) return parseFloat(m[1]);
  }
  return 0;
}
