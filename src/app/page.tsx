"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Brain, Trophy, Search, Layers, Zap } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { MOCK_MAPS, PLATFORM_STATS } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const FEATURES = [
  { icon: Search,    title: "Map Database",   desc: "4,800+ maps. Filter by difficulty, BPM, tags, and style.",          color: "#0077ff" },
  { icon: BarChart2, title: "Deep Analysis",   desc: "BPM charts and difficulty graphs for every map.",                   color: "#ff8800" },
  { icon: Brain,     title: "AI Coach",        desc: "Powered by Pollinations AI — free for every user.",                 color: "#cc44ff" },
  { icon: Trophy,    title: "Rankings",        desc: "Global leaderboard. Track XP, accuracy, and clears.",              color: "#ff3355" },
  { icon: Layers,    title: "Pattern Library", desc: "Browse ADOFAI patterns and understand what you're playing.",       color: "#44dd88" },
  { icon: Zap,       title: "Open API",        desc: "Free REST API. Build tools on top of ADOFAI.VERSE data.",          color: "#ffdd00" },
];

export default function HomePage() {
  const featured = MOCK_MAPS.filter((m) => m.status === "FEATURED").slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xs font-bold tracking-widest text-soft uppercase mb-6">
            The Ultimate ADOFAI Platform
          </p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-none">
            <span className="fire-text">PLAY.</span>{" "}
            <span className="ice-text">ANALYZE.</span>
            <br />
            <span className="text-white">DOMINATE.</span>
          </h1>
          <p className="text-lg text-soft max-w-xl mx-auto mb-10">
            Maps, rankings, AI coaching, and deep analytics — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/maps"    className="px-6 py-2.5 fire-btn text-sm">Browse Maps <ArrowRight size={14} className="inline ml-1" /></Link>
            <Link href="/ai"      className="px-6 py-2.5 text-sm font-bold bg-card border border-line hover:border-line-hi rounded-lg text-soft hover:text-white transition-colors">Try AI Coach</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Maps",         value: PLATFORM_STATS.totalMaps,    color: "#ff8800" },
            { label: "Players",      value: PLATFORM_STATS.totalPlayers,  color: "#0077ff" },
            { label: "Records",      value: PLATFORM_STATS.totalRecords,  color: "#cc44ff" },
            { label: "Today",        value: PLATFORM_STATS.todayRecords,  color: "#44dd88" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-2xl font-black tabular-nums" style={{ color }}>{formatNumber(value)}</div>
              <div className="text-xs text-soft mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Maps */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">Featured Maps</h2>
          <Link href="/maps" className="text-sm text-fire hover:underline flex items-center gap-1">
            All maps <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map((m) => <MapCard key={m.id} map={m} />)}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-black text-white mb-8 text-center">Everything you need to improve</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-card border border-line rounded-xl p-5 hover:border-line-hi transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <p className="font-bold text-sm text-white mb-1">{title}</p>
                <p className="text-sm text-soft">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Ready to start?</h2>
          <p className="text-soft mb-8">Join 38,000+ players on the most advanced ADOFAI platform.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="px-8 py-3 fire-btn text-sm">Create Free Account</Link>
            <Link href="/maps"     className="px-8 py-3 text-sm font-bold bg-card border border-line rounded-lg text-soft hover:text-white transition-colors">Browse Maps</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
