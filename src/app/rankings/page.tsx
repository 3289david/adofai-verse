"use client";

import { useState, useEffect } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

interface RankEntry {
  rank: number;
  user: { id: string; username: string; avatar: string | null; country: string | null };
  totalXp: number;
  mapsCleared: number;
  avgAccuracy: number;
  topAccuracy: number;
}

const FLAGS: Record<string, string> = {
  KR:"🇰🇷", JP:"🇯🇵", US:"🇺🇸", CN:"🇨🇳", GB:"🇬🇧",
  AU:"🇦🇺", DE:"🇩🇪", FR:"🇫🇷", CA:"🇨🇦", BR:"🇧🇷",
  RU:"🇷🇺", PL:"🇵🇱", SE:"🇸🇪",
};
const TABS = ["Global XP","Maps Cleared","Avg Accuracy"] as const;
type Tab = (typeof TABS)[number];

export default function RankingsPage() {
  const [tab,     setTab]     = useState<Tab>("Global XP");
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [me,      setMe]      = useState<{ username: string } | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      fetch("/api/rankings?limit=100").then(r => r.json()).catch(() => ({ rankings: [] })),
      fetch("/api/auth/me").then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([d, u]) => {
      setEntries(d.rankings ?? []);
      setMe(u);
      setLoading(false);
    });
  }, []);

  const sorted = [...entries]
    .sort((a,b) =>
      tab === "Global XP"    ? b.totalXp - a.totalXp :
      tab === "Maps Cleared" ? b.mapsCleared - a.mapsCleared :
                               b.avgAccuracy - a.avgAccuracy
    )
    .map((r,i) => ({ ...r, rank: i+1 }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Global Rankings</h1>
        {!loading && <p className="text-sm text-soft mt-1">{entries.length} players ranked</p>}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              t === tab ? "bg-fire/10 border border-fire/25 text-fire" : "text-soft hover:text-white border border-transparent"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 size={28} className="text-soft animate-spin" /></div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-line rounded-xl text-center px-4">
          <Trophy size={40} className="text-dim mb-4" />
          <p className="font-bold text-white mb-1">No rankings yet</p>
          <p className="text-sm text-soft mb-6">Be the first to submit a record!</p>
          {!me && <Link href="/register" className="px-6 py-2.5 fire-btn text-sm">Join ADOFAI.NET</Link>}
          {me  && <Link href="/maps"     className="px-6 py-2.5 fire-btn text-sm">Browse Maps</Link>}
        </div>
      ) : (
        <>
          {sorted.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[sorted[1], sorted[0], sorted[2]].map((entry, i) => {
                if (!entry) return null;
                const colors  = ["#c0c0c0","#ffd700","#cd7f32"];
                const heights = ["h-28","h-36","h-24"];
                const c = colors[i];
                return (
                  <div key={entry.user.id} className="flex flex-col items-center">
                    <div className="text-center mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-1" style={{background:`${c}20`,border:`2px solid ${c}50`,color:c}}>
                        {entry.user.username[0].toUpperCase()}
                      </div>
                      <p className="text-xs font-bold text-white truncate max-w-[80px] sm:max-w-none">{entry.user.username}</p>
                      <p className="text-xs text-dim">{FLAGS[entry.user.country ?? ""] ?? "🌍"}</p>
                    </div>
                    <div className={`w-full ${heights[i]} rounded-t-xl flex flex-col items-center justify-end pb-3`} style={{background:`${c}10`,border:`1px solid ${c}25`,borderBottom:"none"}}>
                      <Trophy size={14} style={{color:c}} className="mb-1" />
                      <span className="text-lg font-black" style={{color:c}}>#{entry.rank}</span>
                      <span className="text-xs text-white/70">
                        {tab === "Global XP" ? `${formatNumber(entry.totalXp)} XP` : tab === "Maps Cleared" ? `${entry.mapsCleared}` : `${entry.avgAccuracy.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-card border border-line rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-line">
                <tr className="text-xs text-soft font-bold">
                  <th className="text-left px-4 py-3">RANK</th>
                  <th className="text-left px-4 py-3">PLAYER</th>
                  <th className="text-right px-4 py-3">XP</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">CLEARED</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">AVG ACC</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry) => (
                  <tr key={entry.user.id} className="border-b border-line/50 hover:bg-page/50 transition-colors">
                    <td className="px-4 py-3">
                      {entry.rank <= 3
                        ? <span className="font-black text-sm" style={{color:["#ffd700","#c0c0c0","#cd7f32"][entry.rank-1]}}>#{entry.rank}</span>
                        : <span className="text-sm text-white/60">#{entry.rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-line flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {entry.user.avatar
                            ? <img src={entry.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            : entry.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/profile/${entry.user.username}`} className="text-sm font-medium text-white hover:underline">{entry.user.username}</Link>
                          <p className="text-xs text-white/50">{FLAGS[entry.user.country ?? ""] ?? "🌍"} {entry.user.country ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-fire-2 tabular-nums">{formatNumber(entry.totalXp)}</td>
                    <td className="px-4 py-3 text-right text-sm text-ice tabular-nums hidden sm:table-cell">{entry.mapsCleared}</td>
                    <td className="px-4 py-3 text-right text-sm text-easy tabular-nums hidden sm:table-cell">{entry.avgAccuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!me && (
            <div className="mt-8 text-center">
              <p className="text-white/70 text-sm mb-3">Want to appear on the leaderboard?</p>
              <Link href="/register" className="inline-block px-6 py-2.5 fire-btn text-sm">Join ADOFAI.NET</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
