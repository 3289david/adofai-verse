"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Heart, Download, BarChart2, Trophy, Brain,
  Clock, Music, User, Calendar, Layers
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { MOCK_MAPS } from "@/lib/mock-data";
import {
  formatDuration, formatBpm, formatNumber, getDifficultyColor, getDifficultyLabel,
} from "@/lib/utils";
import type { AIAnalysisResult } from "@/lib/types";

const TABS = ["Overview", "BPM Chart", "AI Analysis", "Records"] as const;
type Tab = (typeof TABS)[number];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: "rgba(10,10,20,0.95)",
          border: "1px solid rgba(26,26,53,0.8)",
          color: "#f0f0ff",
        }}
      >
        <p style={{ color: "#7777aa" }}>{label}s</p>
        <p style={{ color: "#0099ff" }}>
          <strong>{payload[0].value} BPM</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function MapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const map = MOCK_MAPS.find((m) => m.id === id);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [liked, setLiked] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState("");

  if (!map) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-xl font-bold" style={{ color: "#f0f0ff" }}>
          Map not found
        </p>
        <Link href="/maps" className="text-sm" style={{ color: "#ff8800" }}>
          ← Back to Maps
        </Link>
      </div>
    );
  }

  const diffColor = getDifficultyColor(map.difficulty);

  async function runAIAnalysis() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setAiResult(data);
    } catch {
      setAiError("AI analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/maps"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-all hover:gap-2.5"
        style={{ color: "#7777aa" }}
      >
        <ArrowLeft size={14} />
        Back to Maps
      </Link>

      <div
        className="relative rounded-2xl overflow-hidden mb-8 p-8"
        style={{
          background: `linear-gradient(135deg, rgba(16,16,30,0.95), rgba(10,10,22,0.95))`,
          border: `1px solid ${diffColor}33`,
          boxShadow: `0 0 40px ${diffColor}10`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 60% at 100% 0%, ${diffColor}10 0%, transparent 60%)`,
          }}
        />

        <div className="relative flex flex-col sm:flex-row gap-6">
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${diffColor}15`, border: `1px solid ${diffColor}30` }}
          >
            <Music size={32} style={{ color: diffColor, opacity: 0.7 }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <DifficultyBadge difficulty={map.difficulty} size="lg" showLabel />
              {map.status === "FEATURED" && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(255,136,0,0.15)",
                    border: "1px solid rgba(255,136,0,0.35)",
                    color: "#ff8800",
                  }}
                >
                  FEATURED
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1" style={{ color: "#f0f0ff" }}>
              {map.title}
            </h1>
            <p className="text-base mb-4" style={{ color: "#7777aa" }}>
              {map.artist}
            </p>

            <div className="flex flex-wrap gap-4 text-sm mb-5" style={{ color: "#7777aa" }}>
              <span className="flex items-center gap-1.5">
                <User size={13} />
                <Link
                  href={`/profile/${map.creator.username}`}
                  className="hover:underline"
                  style={{ color: "#0099ff" }}
                >
                  {map.creator.username}
                </Link>
              </span>
              <span className="flex items-center gap-1.5">
                <Music size={13} style={{ color: "#0099ff" }} />
                {formatBpm(map.bpmMin, map.bpmMax)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {formatDuration(map.duration)}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers size={13} />
                {map.tileCount.toLocaleString()} tiles
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(map.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {map.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-lg"
                  style={{
                    background: "rgba(119,119,170,0.12)",
                    border: "1px solid rgba(119,119,170,0.2)",
                    color: "#7777aa",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {map.downloadUrl && (
                <a
                  href={map.downloadUrl}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #ff2244, #ff8800)",
                    color: "white",
                  }}
                >
                  <Download size={14} />
                  Download Map
                </a>
              )}
              <button
                onClick={() => setLiked(!liked)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: liked ? "rgba(255,34,68,0.15)" : "rgba(16,16,30,0.8)",
                  border: liked ? "1px solid rgba(255,34,68,0.4)" : "1px solid rgba(26,26,53,0.8)",
                  color: liked ? "#ff2244" : "#7777aa",
                }}
              >
                <Heart size={14} fill={liked ? "currentColor" : "none"} />
                {formatNumber(map.likeCount + (liked ? 1 : 0))}
              </button>
            </div>
          </div>

          <div
            className="sm:text-right flex sm:flex-col gap-4 sm:gap-0"
            style={{ color: "#7777aa" }}
          >
            <div className="sm:mb-4">
              <div className="text-xl font-black" style={{ color: "#ff8800" }}>
                {formatNumber(map.playCount)}
              </div>
              <div className="text-xs">Plays</div>
            </div>
            <div>
              <div className="text-xl font-black" style={{ color: "#ff2244" }}>
                {formatNumber(map.likeCount)}
              </div>
              <div className="text-xs">Likes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const icons = {
            Overview: BarChart2,
            "BPM Chart": Music,
            "AI Analysis": Brain,
            Records: Trophy,
          };
          const Icon = icons[tab];
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
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

      <div
        className="rounded-xl p-6"
        style={{
          background: "rgba(16,16,30,0.8)",
          border: "1px solid rgba(26,26,53,0.8)",
        }}
      >
        {activeTab === "Overview" && (
          <div>
            {map.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-2" style={{ color: "#f0f0ff" }}>
                  Description
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#7777aa" }}>
                  {map.description}
                </p>
              </div>
            )}

            <h3 className="text-sm font-bold mb-4" style={{ color: "#f0f0ff" }}>
              Map Stats
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Difficulty", value: map.difficulty, sub: getDifficultyLabel(map.difficulty), color: getDifficultyColor(map.difficulty) },
                { label: "BPM", value: formatBpm(map.bpmMin, map.bpmMax), sub: map.bpmMin === map.bpmMax ? "Constant" : "Variable", color: "#0099ff" },
                { label: "Duration", value: formatDuration(map.duration), sub: "Total length", color: "#cc44ff" },
                { label: "Tiles", value: map.tileCount.toLocaleString(), sub: "Total tile count", color: "#44dd88" },
              ].map(({ label, value, sub, color }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(7,7,15,0.6)",
                    border: `1px solid ${color}22`,
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: "#7777aa" }}>
                    {label}
                  </div>
                  <div className="text-lg font-black" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#44445a" }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "BPM Chart" && (
          <div>
            <h3 className="text-sm font-bold mb-6" style={{ color: "#f0f0ff" }}>
              BPM Over Time
            </h3>
            {map.bpmData && map.bpmData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={map.bpmData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0099ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0099ff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,53,0.6)" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(v) => `${v}s`}
                    tick={{ fill: "#7777aa", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(26,26,53,0.8)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#7777aa", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="bpm"
                    stroke="#0099ff"
                    strokeWidth={2}
                    fill="url(#bpmGradient)"
                    dot={{ fill: "#0099ff", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#00ddff", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48" style={{ color: "#44445a" }}>
                No BPM data available
              </div>
            )}
            <p className="text-xs mt-4" style={{ color: "#44445a" }}>
              BPM range: <span style={{ color: "#0099ff" }}>{map.bpmMin}</span> —{" "}
              <span style={{ color: "#0099ff" }}>{map.bpmMax}</span>
            </p>
          </div>
        )}

        {activeTab === "AI Analysis" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold" style={{ color: "#f0f0ff" }}>
                  AI Map Analysis
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#7777aa" }}>
                  Powered by Pollinations AI — free for all users
                </p>
              </div>
              {!aiResult && (
                <button
                  onClick={runAIAnalysis}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: aiLoading
                      ? "rgba(204,68,255,0.1)"
                      : "linear-gradient(135deg, #cc44ff, #0099ff)",
                    color: "white",
                    opacity: aiLoading ? 0.7 : 1,
                  }}
                >
                  <Brain size={14} />
                  {aiLoading ? "Analyzing…" : "Analyze with AI"}
                </button>
              )}
            </div>

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{ borderColor: "#cc44ff", borderTopColor: "transparent" }}
                />
                <p className="text-sm" style={{ color: "#7777aa" }}>
                  AI is analyzing the map…
                </p>
              </div>
            )}

            {aiError && (
              <div
                className="p-4 rounded-xl text-sm"
                style={{
                  background: "rgba(255,34,68,0.08)",
                  border: "1px solid rgba(255,34,68,0.2)",
                  color: "#ff8888",
                }}
              >
                {aiError}
              </div>
            )}

            {aiResult && !aiLoading && (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: "rgba(204,68,255,0.15)", color: "#cc44ff" }}
                    >
                      PLAY STYLE
                    </span>
                  </div>
                  <p className="text-base font-bold" style={{ color: "#f0f0ff" }}>
                    {aiResult.play_style}
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>
                    WHY IT&#39;S HARD
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#f0f0ff" }}>
                    {aiResult.difficulty_explanation}
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
                >
                  <p className="text-xs font-bold mb-3" style={{ color: "#7777aa" }}>
                    TIPS TO CLEAR
                  </p>
                  <ul className="space-y-2">
                    {aiResult.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#f0f0ff" }}>
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(255,136,0,0.15)", color: "#ff8800" }}
                        >
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>
                      HARDEST SECTION
                    </p>
                    <p className="text-sm" style={{ color: "#ff8888" }}>
                      {aiResult.hardest_section}
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>
                      RECOMMENDED FOR
                    </p>
                    <p className="text-sm" style={{ color: "#44dd88" }}>
                      {aiResult.recommended_for}
                    </p>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>
                    PRACTICE ADVICE
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#f0f0ff" }}>
                    {aiResult.practice_advice}
                  </p>
                </div>

                <button
                  onClick={() => { setAiResult(null); setAiError(""); }}
                  className="text-xs" style={{ color: "#44445a" }}
                >
                  Re-analyze
                </button>
              </div>
            )}

            {!aiResult && !aiLoading && !aiError && (
              <div
                className="flex flex-col items-center justify-center py-16 gap-4 text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(204,68,255,0.1)", border: "1px solid rgba(204,68,255,0.2)" }}
                >
                  <Brain size={28} style={{ color: "#cc44ff" }} />
                </div>
                <div>
                  <p className="font-bold" style={{ color: "#f0f0ff" }}>
                    AI-Powered Map Analysis
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#7777aa" }}>
                    Get difficulty breakdown, tips, and coaching from AI
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Records" && (
          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: "#f0f0ff" }}>
              Top Records
            </h3>
            <div
              className="flex flex-col items-center justify-center py-16 gap-3 text-center"
            >
              <Trophy size={40} style={{ color: "#44445a" }} />
              <p className="text-base font-medium" style={{ color: "#7777aa" }}>
                No records yet
              </p>
              <p className="text-sm" style={{ color: "#44445a" }}>
                Be the first to submit a record for this map!
              </p>
              <Link
                href="/register"
                className="mt-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #ff2244, #ff8800)",
                  color: "white",
                }}
              >
                Sign Up to Submit
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
