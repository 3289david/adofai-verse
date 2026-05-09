import Link from "next/link";
import { ArrowRight, Upload, Trophy, BarChart2, Brain, Star, TrendingUp, Clock, Flame } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatNumber, formatBpm } from "@/lib/utils";
import type { MapData } from "@/lib/types";
import type { Prisma } from "@prisma/client";

type MapWithCreator = Prisma.MapGetPayload<{
  include: { creator: { select: { id: true; username: true; avatar: true } } };
}>;

async function getData() {
  try {
    const [popular, mapCount, playerCount, recordCount, recentRecords] = await Promise.all([
      db.map.findMany({
        where:   { status: { in: ["APPROVED", "FEATURED"] } },
        take:    12,
        orderBy: { playCount: "desc" },
        include: { creator: { select: { id: true, username: true, avatar: true } } },
      }),
      db.map.count({ where: { status: { in: ["APPROVED", "FEATURED"] } } }),
      db.user.count(),
      db.record.count(),
      db.record.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { username: true, avatar: true } },
          map:  { select: { id: true, title: true, difficulty: true } },
        },
      }),
    ]);

    let dailyMap: MapWithCreator | null = null;
    if (mapCount > 0) {
      const dayIndex = Math.floor(Date.now() / 86_400_000);
      const offset = dayIndex % mapCount;
      const [picked] = await db.map.findMany({
        where:   { status: { in: ["APPROVED", "FEATURED"] } },
        orderBy: { createdAt: "asc" },
        skip:    offset,
        take:    1,
        include: { creator: { select: { id: true, username: true, avatar: true } } },
      });
      dailyMap = picked ?? null;
    }

    return { popular, dailyMap, stats: { maps: mapCount, players: playerCount, records: recordCount }, recentRecords };
  } catch {
    return { popular: [], dailyMap: null as MapWithCreator | null, stats: { maps: 0, players: 0, records: 0 }, recentRecords: [] };
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
  const [{ popular, dailyMap, stats, recentRecords }, user] = await Promise.all([getData(), getCurrentUser()]);

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

      {/* Map of the Day */}
      {dailyMap && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-2 mb-6">
            <Flame size={18} style={{ color: "#ff8800" }} />
            <h2 className="text-lg font-black text-white">Map of the Day</h2>
          </div>
          <Link href={`/maps/${dailyMap.id}`} className="block group">
            <div
              className="relative rounded-xl overflow-hidden p-[2px]"
              style={{ background: "linear-gradient(135deg, #ff3355, #ff8800)" }}
            >
              <div className="flex flex-col sm:flex-row rounded-[10px] overflow-hidden" style={{ background: "#07070f" }}>
                <div className="sm:w-80 h-48 sm:h-auto relative overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(16,16,30,1), rgba(26,26,53,0.8))" }}>
                  {dailyMap.coverImage ? (
                    <img src={dailyMap.coverImage} alt={dailyMap.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 40 40" fill="none" className="opacity-20">
                        <rect x="5" y="5" width="30" height="30" rx="4" fill="currentColor" transform="rotate(45 20 20)" className="text-soft" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#07070f]/60 hidden sm:block" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <DifficultyBadge difficulty={dailyMap.difficulty} size="sm" />
                    {dailyMap.status === "FEATURED" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,136,0,0.15)", color: "#ff8800" }}>FEATURED</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-fire transition-colors">{dailyMap.title}</h3>
                  <p className="text-sm mb-3" style={{ color: "#7777aa" }}>{dailyMap.artist}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "#7777aa" }}>
                    {(dailyMap.bpmMin > 0 || dailyMap.bpmMax > 0) && (
                      <span>{formatBpm(dailyMap.bpmMin, dailyMap.bpmMax)}</span>
                    )}
                    {dailyMap.creator && <span>by {dailyMap.creator.username}</span>}
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-[10px] text-white" style={{ background: "linear-gradient(135deg, #ff3355, #ff8800)" }}>
                      Play Now <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

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

      {/* Recent Activity */}
      {recentRecords.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock size={18} className="text-ice" />Recent Activity
              </h2>
              <Link href="/rankings" className="text-sm text-fire hover:underline flex items-center gap-1">
                Rankings <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentRecords.map((rec: any) => (
                <div key={rec.id} className="flex items-center gap-3 p-3 bg-card border border-line rounded-xl hover:border-line-hi transition-colors">
                  <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-xs font-bold text-soft flex-shrink-0">
                    {rec.user?.avatar
                      ? <img src={rec.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      : (rec.user?.username?.[0] ?? "?").toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      <span className="font-bold">{rec.user?.username ?? "Unknown"}</span>
                      <span className="text-soft"> scored </span>
                      <span className="font-bold text-easy">{rec.accuracy.toFixed(2)}%</span>
                      <span className="text-soft"> on </span>
                      <Link href={`/maps/${rec.map?.id}`} className="font-medium text-ice hover:underline">{rec.map?.title ?? "a map"}</Link>
                    </p>
                  </div>
                  {rec.cleared && <span className="text-[10px] font-bold text-ice px-2 py-0.5 rounded bg-ice/10 border border-ice/20 flex-shrink-0">CLEARED</span>}
                  <span className="text-xs text-dim flex-shrink-0 hidden sm:block">{new Date(rec.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-t border-line bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-lg font-black text-white text-center mb-8">Everything You Need</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { icon: Star,       color: "#ffd700", label: "Map Database",    href: "/maps" },
              { icon: Trophy,     color: "#ff8800", label: "Global Rankings", href: "/rankings" },
              { icon: BarChart2,  color: "#0077ff", label: "File Analyzer",   href: "/analyze" },
              { icon: Brain,      color: "#cc44ff", label: "AI Coach",        href: "/ai" },
              { icon: Upload,     color: "#44dd88", label: "Upload Maps",     href: "/upload" },
              { icon: TrendingUp, color: "#ff3355", label: "Leaderboards",    href: "/rankings" },
            ].map(({ icon: Icon, color, label, href }) => (
              <Link key={label} href={href}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-line rounded-xl hover:border-line-hi transition-colors group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={20} style={{ color }} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-soft group-hover:text-white transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
