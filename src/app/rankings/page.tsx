"use client";

import { useState } from "react";
import { Trophy, Medal, Star, Globe, TrendingUp } from "lucide-react";
import { MOCK_RANKINGS } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const COUNTRY_FLAGS: Record<string, string> = {
  KR: "🇰🇷", JP: "🇯🇵", US: "🇺🇸", CN: "🇨🇳",
  GB: "🇬🇧", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷",
};

const TABS = ["Global XP", "Maps Cleared", "Avg Accuracy"] as const;
type Tab = (typeof TABS)[number];

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={16} style={{ color: "#ffd700" }} />;
  if (rank === 2) return <Medal size={16} style={{ color: "#c0c0c0" }} />;
  if (rank === 3) return <Medal size={16} style={{ color: "#cd7f32" }} />;
  return <span className="text-sm font-bold tabular-nums" style={{ color: "#44445a" }}>#{rank}</span>;
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Global XP");

  const sorted = [...MOCK_RANKINGS].sort((a, b) => {
    if (activeTab === "Global XP") return b.totalXp - a.totalXp;
    if (activeTab === "Maps Cleared") return b.mapsCleared - a.mapsCleared;
    return b.avgAccuracy - a.avgAccuracy;
  }).map((r, i) => ({ ...r, rank: i + 1 }));

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>
          Global Rankings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7777aa" }}>
          Top players by performance across all maps
        </p>
      </div>

      <div className="flex gap-1 mb-8">
        {TABS.map((tab) => {
          const icons = {
            "Global XP": Star,
            "Maps Cleared": Globe,
            "Avg Accuracy": TrendingUp,
          };
          const Icon = icons[tab];
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "rgba(255,34,68,0.12)" : "transparent",
                border: active ? "1px solid rgba(255,34,68,0.25)" : "1px solid transparent",
                color: active ? "#ff8888" : "#7777aa",
              }}
            >
              <Icon size={13} />
              {tab}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          if (!entry) return null;
          const podiumOrder = [1, 0, 2];
          const heights = ["h-32", "h-40", "h-28"];
          const trophyColors = ["#c0c0c0", "#ffd700", "#cd7f32"];
          const golds = ["#c0c0c0", "#ffd700", "#cd7f32"];

          return (
            <div key={entry.user.id} className="flex flex-col items-center">
              <div className="mb-3 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black mx-auto mb-1"
                  style={{
                    background: `${golds[i]}22`,
                    border: `2px solid ${golds[i]}55`,
                    color: golds[i],
                  }}
                >
                  {entry.user.username.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-bold" style={{ color: "#f0f0ff" }}>
                  {entry.user.username}
                </p>
                {entry.user.country && (
                  <p className="text-xs" style={{ color: "#44445a" }}>
                    {COUNTRY_FLAGS[entry.user.country] ?? "🌍"}
                  </p>
                )}
              </div>
              <div
                className={`w-full ${heights[i]} rounded-t-xl flex flex-col items-center justify-end pb-3 relative`}
                style={{
                  background: `linear-gradient(to top, ${golds[i]}18, transparent)`,
                  border: `1px solid ${golds[i]}30`,
                  borderBottom: "none",
                }}
              >
                <Trophy size={18} style={{ color: trophyColors[i] }} className="mb-1" />
                <span className="text-xl font-black" style={{ color: golds[i] }}>
                  #{entry.rank}
                </span>
                <span className="text-xs" style={{ color: "#7777aa" }}>
                  {activeTab === "Global XP"
                    ? `${formatNumber(entry.totalXp)} XP`
                    : activeTab === "Maps Cleared"
                    ? `${entry.mapsCleared} maps`
                    : `${entry.avgAccuracy.toFixed(1)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(26,26,53,0.8)" }}
      >
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: "rgba(16,16,30,0.95)",
                borderBottom: "1px solid rgba(26,26,53,0.8)",
              }}
            >
              <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: "#7777aa" }}>
                RANK
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: "#7777aa" }}>
                PLAYER
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: "#7777aa" }}>
                TOTAL XP
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold hidden sm:table-cell" style={{ color: "#7777aa" }}>
                CLEARED
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold hidden sm:table-cell" style={{ color: "#7777aa" }}>
                AVG ACC
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold hidden md:table-cell" style={{ color: "#7777aa" }}>
                BEST
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => {
              const rowColors = ["rgba(255,215,0,0.04)", "rgba(192,192,192,0.03)", "rgba(205,127,50,0.03)"];
              return (
                <tr
                  key={entry.user.id}
                  className="transition-all hover:bg-white/[0.02]"
                  style={{
                    background: idx < 3 ? rowColors[idx] : "transparent",
                    borderBottom: "1px solid rgba(26,26,53,0.5)",
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center w-8">
                      <RankMedal rank={entry.rank} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: "rgba(119,119,170,0.15)",
                          color: "#7777aa",
                        }}
                      >
                        {entry.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#f0f0ff" }}>
                          {entry.user.username}
                        </p>
                        {entry.user.country && (
                          <p className="text-xs" style={{ color: "#44445a" }}>
                            {COUNTRY_FLAGS[entry.user.country] ?? "🌍"} {entry.user.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold tabular-nums" style={{ color: "#ff8800" }}>
                      {formatNumber(entry.totalXp)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-sm tabular-nums" style={{ color: "#0099ff" }}>
                      {entry.mapsCleared}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-sm tabular-nums" style={{ color: "#44dd88" }}>
                      {entry.avgAccuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm tabular-nums" style={{ color: "#cc44ff" }}>
                      {entry.topAccuracy.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="mt-8 p-6 rounded-xl text-center"
        style={{
          background: "rgba(16,16,30,0.6)",
          border: "1px solid rgba(26,26,53,0.8)",
        }}
      >
        <p className="text-sm" style={{ color: "#7777aa" }}>
          Want to see your name on the leaderboard?
        </p>
        <a
          href="/register"
          className="inline-block mt-3 px-6 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #ff2244, #ff8800)",
            color: "white",
          }}
        >
          Join ADOFAI.VERSE
        </a>
      </div>
    </div>
  );
}
