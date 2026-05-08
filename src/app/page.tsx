import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import type { MapData } from "@/lib/types";
import type { Prisma } from "@prisma/client";

type MapWithCreator = Prisma.MapGetPayload<{
  include: { creator: { select: { id: true; username: true; avatar: true } } };
}>;

async function getData() {
  try {
    const [popular, mapCount, playerCount, recordCount] = await Promise.all([
      db.map.findMany({
        where:   { status: { in: ["APPROVED", "FEATURED"] } },
        take:    12,
        orderBy: { playCount: "desc" },
        include: { creator: { select: { id: true, username: true, avatar: true } } },
      }),
      db.map.count({ where: { status: { in: ["APPROVED", "FEATURED"] } } }),
      db.user.count(),
      db.record.count(),
    ]);
    return { popular, stats: { maps: mapCount, players: playerCount, records: recordCount } };
  } catch {
    return { popular: [], stats: { maps: 0, players: 0, records: 0 } };
  }
}

function toMapData(m: MapWithCreator): MapData {
  return {
    ...m,
    bpmData:   m.bpmData as MapData["bpmData"],
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  } as MapData;
}

export default async function HomePage() {
  const [{ popular, stats }, user] = await Promise.all([getData(), getCurrentUser()]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 leading-none">
            <span className="fire-text">ADOFAI</span>
            <span className="text-white">.NET</span>
          </h1>
          <p className="text-lg text-soft mb-8">
            Maps, rankings, AI coaching, and deep analytics for<br className="hidden sm:block" />
            A Dance of Fire and Ice.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/maps" className="px-7 py-2.5 fire-btn text-sm">
              Browse Maps <ArrowRight size={13} className="inline ml-1" />
            </Link>
            {user ? (
              <Link href="/upload" className="px-7 py-2.5 text-sm font-bold bg-card border border-line rounded-[10px] text-soft hover:text-white hover:border-line-hi transition-colors flex items-center gap-1.5">
                <Upload size={13} />Upload Map
              </Link>
            ) : (
              <Link href="/register" className="px-7 py-2.5 text-sm font-bold bg-card border border-line rounded-[10px] text-soft hover:text-white hover:border-line-hi transition-colors">
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line bg-card/30">
        <div className="mx-auto max-w-2xl px-4 py-8 grid grid-cols-3 divide-x divide-line text-center">
          {[
            { label: "Maps",    value: stats.maps,    color: "#ff8800" },
            { label: "Players", value: stats.players, color: "#0077ff" },
            { label: "Records", value: stats.records, color: "#cc44ff" },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4">
              <div className="text-3xl font-black tabular-nums" style={{ color }}>{formatNumber(value)}</div>
              <div className="text-sm text-soft mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular maps */}
      {popular.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-white">Popular Maps</h2>
            <Link href="/maps" className="text-sm text-fire hover:underline flex items-center gap-1">
              All maps <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popular.map(m => <MapCard key={m.id} map={toMapData(m)} />)}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="text-4xl mb-4">🎵</div>
          <h2 className="text-xl font-black text-white mb-2">No maps yet</h2>
          <p className="text-soft mb-6">Be the first to upload a map to ADOFAI.NET.</p>
          <div className="flex justify-center gap-3">
            <Link href="/upload"  className="px-6 py-2.5 fire-btn text-sm">Upload a Map</Link>
            <Link href="/api-docs" className="px-6 py-2.5 text-sm font-bold bg-card border border-line rounded-[10px] text-soft hover:text-white transition-colors">API Docs</Link>
          </div>
        </section>
      )}
    </div>
  );
}
