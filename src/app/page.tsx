"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Brain, Trophy, Zap, Search, Flame, Layers } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { MOCK_MAPS, PLATFORM_STATS } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const FEATURES = [
  {
    icon: Search,
    title: "Map Database",
    description: "4,800+ custom maps with advanced filtering by difficulty, BPM, tags, and playstyle.",
    color: "#0099ff",
  },
  {
    icon: BarChart2,
    title: "Deep Analysis",
    description: "Interactive BPM charts, pattern difficulty graphs, and per-section failure rate visualization.",
    color: "#ff8800",
  },
  {
    icon: Brain,
    title: "AI Coach",
    description: "Powered by Pollinations AI — get personalized advice, map breakdowns, and improvement tips.",
    color: "#cc44ff",
  },
  {
    icon: Trophy,
    title: "Global Rankings",
    description: "Track your records against the world. Filter by country, map, or score.",
    color: "#ff2244",
  },
  {
    icon: Layers,
    title: "Pattern Library",
    description: "Browse and identify famous ADOFAI patterns. Improve by understanding what you're playing.",
    color: "#44dd88",
  },
  {
    icon: Zap,
    title: "Open API",
    description: "Developer-friendly REST API. Build your own tools on top of ADOFAI.VERSE data.",
    color: "#ffdd00",
  },
];

export default function HomePage() {
  const featuredMaps = MOCK_MAPS.filter((m) => m.status === "FEATURED").slice(0, 6);

  return (
    <div className="tile-bg">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,34,68,0.12) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 80% 60%, rgba(0,153,255,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(255,136,0,0.1)",
              border: "1px solid rgba(255,136,0,0.25)",
              color: "#ff8800",
            }}
          >
            <Flame size={12} />
            The Ultimate ADOFAI Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            <span
              style={{
                background: "linear-gradient(135deg, #ff2244 0%, #ff5500 40%, #ff8800 60%, #ffdd00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PLAY.
            </span>{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #cc44ff 0%, #0099ff 50%, #00ddff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ANALYZE.
            </span>
            <br />
            <span style={{ color: "#f0f0ff" }}>DOMINATE.</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#7777aa" }}
          >
            The most advanced community platform for{" "}
            <span style={{ color: "#f0f0ff" }}>A Dance of Fire and Ice</span>. Find maps,
            track your progress, get AI coaching, and compete with players worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/maps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #ff2244, #ff8800)",
                color: "white",
                boxShadow: "0 0 24px rgba(255,34,68,0.3)",
              }}
            >
              Browse Maps
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(204,68,255,0.12)",
                border: "1px solid rgba(204,68,255,0.35)",
                color: "#cc44ff",
              }}
            >
              <Brain size={16} />
              Try AI Coach
            </Link>
          </div>

          <div
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { label: "Maps", value: PLATFORM_STATS.totalMaps, color: "#ff8800" },
              { label: "Players", value: PLATFORM_STATS.totalPlayers, color: "#0099ff" },
              { label: "Records", value: PLATFORM_STATS.totalRecords, color: "#cc44ff" },
              { label: "Today", value: PLATFORM_STATS.todayRecords, color: "#44dd88" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="text-center p-4 rounded-xl"
                style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
              >
                <div
                  className="text-2xl sm:text-3xl font-black tabular-nums"
                  style={{ color }}
                >
                  {formatNumber(value)}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#7777aa" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black" style={{ color: "#f0f0ff" }}>
              Featured Maps
            </h2>
            <p className="text-sm mt-1" style={{ color: "#7777aa" }}>
              Hand-picked by our community
            </p>
          </div>
          <Link
            href="/maps"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:gap-2.5"
            style={{ color: "#ff8800" }}
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredMaps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>
            Everything you need to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #ff2244, #ff8800)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              improve
            </span>
          </h2>
          <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: "#7777aa" }}>
            ADOFAI.VERSE is the only platform you need to master A Dance of Fire and Ice
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 group"
              style={{
                background: "rgba(16,16,30,0.8)",
                borderColor: "rgba(26,26,53,0.8)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}44`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${color}12`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(26,26,53,0.8)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}33`,
                }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: "#f0f0ff" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7777aa" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-4 sm:mx-8 lg:mx-auto max-w-4xl my-16 p-12 rounded-2xl text-center overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,34,68,0.12), rgba(204,68,255,0.08), rgba(0,153,255,0.12))",
          border: "1px solid rgba(255,34,68,0.2)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,34,68,0.06) 0%, transparent 70%)",
          }}
        />
        <h2 className="relative text-3xl font-black mb-4" style={{ color: "#f0f0ff" }}>
          Ready to start your journey?
        </h2>
        <p className="relative text-base mb-8" style={{ color: "#7777aa" }}>
          Join 38,000+ players tracking their ADOFAI progress on the most advanced platform ever built.
        </p>
        <div className="relative flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #ff2244, #ff8800)",
              color: "white",
              boxShadow: "0 0 24px rgba(255,34,68,0.3)",
            }}
          >
            Create Free Account
          </Link>
          <Link
            href="/maps"
            className="px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200"
            style={{
              border: "1px solid rgba(240,240,255,0.15)",
              color: "#f0f0ff",
            }}
          >
            Explore Maps
          </Link>
        </div>
      </section>
    </div>
  );
}
