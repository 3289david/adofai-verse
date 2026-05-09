"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Heart, Download, Clock, Music, User, Calendar, Layers,
  Brain, BarChart2, Trophy, Loader2, Youtube, ExternalLink, Play,
  RefreshCw, Shield, Globe, CheckCircle, Send,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import {
  formatDuration, formatBpm, formatNumber,
  getDifficultyColor, getDifficultyLabel,
} from "@/lib/utils";
import type { MapData, MapRecord, AIAnalysisResult, AuthUser } from "@/lib/types";

const FLAGS: Record<string, string> = {
  KR: "🇰🇷", JP: "🇯🇵", US: "🇺🇸", CN: "🇨🇳", GB: "🇬🇧",
  AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷", CA: "🇨🇦", BR: "🇧🇷",
  RU: "🇷🇺", PL: "🇵🇱", SE: "🇸🇪", NL: "🇳🇱", IT: "🇮🇹",
};

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return m?.[1] ?? null;
}

const SOURCE_LABEL: Record<string, string> = {
  "adofaigg:": "adofai.gg",
  "steam:":    "Steam Workshop",
};

function sourceLabel(externalId?: string | null) {
  if (!externalId) return null;
  for (const [prefix, label] of Object.entries(SOURCE_LABEL)) {
    if (externalId.startsWith(prefix)) return label;
  }
  return null;
}

function estimateDuration(tileCount: number, bpmMin: number, bpmMax: number): number {
  if (tileCount <= 0) return 0;
  const avg = bpmMin > 0 && bpmMax > 0 ? (bpmMin + bpmMax) / 2 :
              bpmMax > 0 ? bpmMax : bpmMin > 0 ? bpmMin : 120;
  return Math.round(tileCount * 60 / avg);
}

const TABS = ["Overview", "BPM Chart", "Video", "AI Analysis", "Records"] as const;
type Tab = typeof TABS[number];

export default function MapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [map,         setMap]         = useState<MapData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null | undefined>(undefined);
  const [tab,         setTab]         = useState<Tab>("Overview");
  const [liked,       setLiked]       = useState(false);
  const [likeCount,   setLikeCount]   = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiResult,    setAiResult]    = useState<AIAnalysisResult | null>(null);
  const [aiError,     setAiError]     = useState("");

  // Record submission state
  const [recAcc,      setRecAcc]      = useState("");
  const [recVideoUrl, setRecVideoUrl] = useState("");
  const [recCleared,  setRecCleared]  = useState(false);
  const [recScore,    setRecScore]    = useState("");
  const [recNote,     setRecNote]     = useState("");
  const [recLoading,  setRecLoading]  = useState(false);
  const [recSuccess,  setRecSuccess]  = useState(false);
  const [recError,    setRecError]    = useState("");
  const [records,     setRecords]     = useState<MapRecord[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/maps/${id}`).then(r => r.ok ? r.json() : null),
      fetch("/api/auth/me").then(r => r.ok ? r.json() : null),
      fetch(`/api/maps/${id}/like`).then(r => r.ok ? r.json() : { liked: false, likeCount: 0 }),
    ]).then(([mapData, user, likeData]) => {
      setMap(mapData);
      setRecords(mapData?.records ?? []);
      setCurrentUser(user);
      setLiked(likeData.liked ?? false);
      setLikeCount(likeData.likeCount ?? mapData?.likeCount ?? 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 size={28} className="text-soft animate-spin" />
    </div>
  );

  if (!map) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-lg font-bold text-white">Map not found</p>
      <Link href="/maps" className="text-fire text-sm hover:underline">← Back to Maps</Link>
    </div>
  );

  const dc           = getDifficultyColor(map.difficulty);
  const ytId         = map.videoUrl ? getYouTubeId(map.videoUrl) : null;
  const hasVideo     = !!map.videoUrl;
  const hasBpm       = (map.bpmData?.length ?? 0) > 0 || map.bpmMin > 0;
  const src          = sourceLabel(map.externalId);
  const displayCreator = map.creatorName || map.creator.username;
  const estDur       = map.duration > 0 ? map.duration : estimateDuration(map.tileCount, map.bpmMin, map.bpmMax);
  const displayDuration = map.duration > 0
    ? formatDuration(map.duration)
    : map.tileCount > 0
      ? formatDuration(estDur) + " ~"
      : "Unknown";
  const bpmChartData = map.bpmData ?? (map.bpmMin > 0 ? [
    { time: 0, bpm: map.bpmMin },
    { time: estDur, bpm: map.bpmMax > map.bpmMin ? map.bpmMax : map.bpmMin },
  ] : []);

  async function toggleLike() {
    if (!currentUser) { window.location.href = "/login"; return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const r = await fetch(`/api/maps/${id}/like`, { method: "POST" });
      if (r.ok) {
        const d = await r.json();
        setLiked(d.liked);
        setLikeCount(d.likeCount);
      }
    } finally { setLikeLoading(false); }
  }

  async function runAI() {
    setAiLoading(true); setAiError("");
    try {
      const r = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map }),
      });
      if (!r.ok) throw new Error();
      setAiResult(await r.json());
    } catch { setAiError("AI analysis failed. Please try again."); }
    finally  { setAiLoading(false); }
  }

  async function submitRecord(e: React.FormEvent) {
    e.preventDefault();
    setRecLoading(true); setRecError(""); setRecSuccess(false);
    try {
      const acc = parseFloat(recAcc);
      if (isNaN(acc) || acc < 0 || acc > 100) {
        setRecError("Accuracy must be between 0 and 100.");
        return;
      }
      if (!recVideoUrl.trim()) {
        setRecError("A gameplay video URL is required.");
        return;
      }
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapId:    id,
          accuracy: acc,
          cleared:  recCleared,
          score:    recScore ? parseInt(recScore) : 0,
          note:     recNote || null,
          videoUrl: recVideoUrl.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setRecError(data.error ?? "Submission failed.");
        return;
      }
      setRecSuccess(true);
      const updated = await fetch(`/api/maps/${id}`).then(r => r.ok ? r.json() : null);
      if (updated?.records) setRecords(updated.records);
      setRecAcc(""); setRecScore(""); setRecNote(""); setRecCleared(false); setRecVideoUrl("");
    } catch { setRecError("Network error. Please try again."); }
    finally  { setRecLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/maps" className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Maps
      </Link>

      {/* ── Header ── */}
      <div className="bg-card border border-line rounded-xl overflow-hidden mb-6" style={{ borderColor: `${dc}30` }}>
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${dc}20, ${dc}08)` }}>
          {map.coverImage && (
            <img src={map.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90" />
        </div>

        <div className="px-6 pb-6 -mt-6 relative">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{ background: `${dc}18`, borderColor: `${dc}40` }}>
              <Music size={30} style={{ color: dc }} />
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <DifficultyBadge difficulty={map.difficulty} size="md" />
                {map.status === "FEATURED" && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-fire-2/15 text-fire-2 border border-fire-2/30">FEATURED</span>
                )}
                {src && (
                  <span className="text-xs px-2 py-0.5 rounded bg-line text-dim border border-line">{src}</span>
                )}
              </div>

              <h1 className="text-2xl font-black text-white leading-tight mb-0.5">{map.title}</h1>
              <p className="text-soft mb-3">{map.artist}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-soft mb-4">
                <span className="flex items-center gap-1">
                  <User size={11} />
                  {map.creatorName
                    ? <span className="text-white font-medium">{map.creatorName}</span>
                    : <Link href={`/profile/${map.creator.username}`} className="text-ice hover:underline">{map.creator.username}</Link>
                  }
                </span>
                {(map.bpmMin > 0 || map.bpmMax > 0) && (
                  <span className="flex items-center gap-1"><Music size={11} />{formatBpm(map.bpmMin, map.bpmMax)}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={11} />{displayDuration}
                </span>
                {map.tileCount > 0 && (
                  <span className="flex items-center gap-1"><Layers size={11} />{map.tileCount.toLocaleString()} tiles</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(map.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {map.downloadUrl && (
                  <a href={map.downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 fire-btn text-sm">
                    <Download size={13} />Download
                  </a>
                )}
                {map.workshopUrl && (
                  <a href={map.workshopUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-line text-soft hover:border-line-hi hover:text-white transition-colors">
                    <ExternalLink size={13} />Workshop
                  </a>
                )}
                {hasVideo && (
                  <button onClick={() => setTab("Video")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 bg-red-500/8 hover:bg-red-500/15 transition-colors">
                    <Youtube size={13} />Watch
                  </button>
                )}
                <button onClick={toggleLike} disabled={likeLoading}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 ${liked ? "bg-fire/10 border-fire/30 text-fire" : "bg-page border-line text-soft hover:border-line-hi"}`}>
                  <Heart size={13} fill={liked ? "currentColor" : "none"} />
                  {formatNumber(likeCount)}
                </button>
              </div>
            </div>

            <div className="flex sm:flex-col gap-6 sm:gap-4 text-right flex-shrink-0">
              <div>
                <div className="text-xl font-black text-fire-2">{formatNumber(map.playCount)}</div>
                <div className="text-xs text-soft">Plays</div>
              </div>
              <div>
                <div className="text-xl font-black text-fire">{formatNumber(likeCount)}</div>
                <div className="text-xs text-soft">Likes</div>
              </div>
              {records.length > 0 && (
                <div>
                  <div className="text-xl font-black text-easy">{records.length}</div>
                  <div className="text-xs text-soft">Records</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TABS.map(t => {
          const icons: Record<Tab, React.ComponentType<{ size?: number }>> = {
            Overview: BarChart2, "BPM Chart": Music, Video: Youtube,
            "AI Analysis": Brain, Records: Trophy,
          };
          const Icon = icons[t];
          const dim = (t === "Video" && !hasVideo) || (t === "BPM Chart" && map.bpmMin === 0);
          return (
            <button key={t} onClick={() => !dim && setTab(t)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                ${t === tab ? "bg-fire/10 border border-fire/25 text-fire"
                  : dim ? "text-dim border border-transparent cursor-default"
                  : "text-soft hover:text-white border border-transparent"}`}>
              <Icon size={13} />{t}
              {t === "Records" && records.length > 0 && (
                <span className="ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-line text-dim">{records.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="bg-card border border-line rounded-xl p-6">

        {/* OVERVIEW */}
        {tab === "Overview" && (
          <div className="space-y-5">
            {map.description && (
              <p className="text-soft text-sm leading-relaxed">{map.description}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Difficulty", val: <DifficultyBadge difficulty={map.difficulty} size="lg" />, sub: getDifficultyLabel(map.difficulty), c: dc },
                { label: "BPM",        val: map.bpmMin > 0 ? formatBpm(map.bpmMin, map.bpmMax) : "Unknown", sub: map.bpmMin === map.bpmMax && map.bpmMin > 0 ? "Constant" : map.bpmMin > 0 ? "Variable" : "—", c: "#0077ff" },
                { label: "Duration",   val: displayDuration, sub: "Total length", c: "#cc44ff" },
                { label: "Tiles",      val: map.tileCount > 0 ? map.tileCount.toLocaleString() : "Unknown", sub: "Total tiles", c: "#44dd88" },
              ].map(({ label, val, sub, c }) => (
                <div key={label} className="bg-page border border-line rounded-xl p-4" style={{ borderColor: `${c}20` }}>
                  <p className="text-xs text-soft mb-1">{label}</p>
                  <div className="text-lg font-black" style={{ color: c }}>{val}</div>
                  <p className="text-xs text-dim mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            {map.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {map.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-line text-soft">{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-page border border-line rounded-xl">
              <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center font-bold text-sm text-soft flex-shrink-0">
                {displayCreator[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{displayCreator}</p>
                <p className="text-xs text-dim">{src ? `Imported from ${src}` : "Level creator"}</p>
              </div>
            </div>
          </div>
        )}

        {/* BPM CHART */}
        {tab === "BPM Chart" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm font-bold text-white">BPM Over Time</p>
              {!map.bpmData && map.bpmMin > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-line text-soft border border-line">estimated range</span>
              )}
            </div>
            {hasBpm ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={bpmChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0077ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0077ff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" />
                  <XAxis dataKey="time" tickFormatter={v => `${v}s`} tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={{ stroke: "#1e1e40" }} tickLine={false} />
                  <YAxis tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "#111127", border: "1px solid #1e1e40", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#6666aa" }} itemStyle={{ color: "#0077ff" }} />
                  <Area type="monotone" dataKey="bpm" stroke="#0077ff" strokeWidth={2} fill="url(#bpmGrad)"
                    dot={{ fill: "#0077ff", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00ccff", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-center">
                <BarChart2 size={32} className="text-dim" />
                <p className="text-soft text-sm">No BPM timeline data for this map</p>
                <p className="text-xs text-dim">Use the Analyze page to get BPM data from a .adofai file</p>
              </div>
            )}
          </div>
        )}

        {/* VIDEO */}
        {tab === "Video" && (
          <div>
            <p className="text-sm font-bold text-white mb-4">Gameplay Video</p>
            {ytId ? (
              <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  title={`${map.title} — Gameplay`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : hasVideo ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Play size={32} className="text-dim" />
                <p className="text-soft text-sm">Video available but not embeddable</p>
                <a href={map.videoUrl!} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-line text-soft text-sm hover:border-line-hi transition-colors">
                  <ExternalLink size={13} />Watch externally
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10">
                <Youtube size={32} className="text-dim" />
                <p className="text-soft text-sm">No video available for this map</p>
              </div>
            )}
          </div>
        )}

        {/* AI ANALYSIS */}
        {tab === "AI Analysis" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold text-white text-sm">AI Map Analysis</p>
                <p className="text-xs text-soft mt-0.5">Powered by Pollinations AI · Free</p>
              </div>
              {!aiResult && (
                <button onClick={runAI} disabled={aiLoading}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#cc44ff,#0077ff)" }}>
                  {aiLoading ? "Analyzing…" : "Analyze with AI"}
                </button>
              )}
            </div>
            {aiLoading && (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#cc44ff", borderTopColor: "transparent" }} />
              </div>
            )}
            {aiError && <div className="p-4 rounded-xl bg-fire/8 border border-fire/20 text-fire text-sm">{aiError}</div>}
            {aiResult && !aiLoading && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-page border border-line">
                  <p className="text-xs text-soft font-bold mb-1">PLAY STYLE</p>
                  <p className="text-base font-bold text-white">{aiResult.play_style}</p>
                </div>
                <div className="p-4 rounded-xl bg-page border border-line">
                  <p className="text-xs text-soft font-bold mb-2">WHY IT&apos;S HARD</p>
                  <p className="text-sm text-white leading-relaxed">{aiResult.difficulty_explanation}</p>
                </div>
                <div className="p-4 rounded-xl bg-page border border-line">
                  <p className="text-xs text-soft font-bold mb-3">TIPS</p>
                  <ul className="space-y-2">
                    {aiResult.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white">
                        <span className="w-5 h-5 rounded-full bg-fire-2/15 text-fire-2 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-page border border-line">
                    <p className="text-xs text-soft font-bold mb-1">HARDEST SECTION</p>
                    <p className="text-sm text-fire">{aiResult.hardest_section}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-page border border-line">
                    <p className="text-xs text-soft font-bold mb-1">RECOMMENDED FOR</p>
                    <p className="text-sm text-easy">{aiResult.recommended_for}</p>
                  </div>
                </div>
                {aiResult.practice_advice && (
                  <div className="p-4 rounded-xl bg-page border border-line">
                    <p className="text-xs text-soft font-bold mb-1">PRACTICE ADVICE</p>
                    <p className="text-sm text-white leading-relaxed">{aiResult.practice_advice}</p>
                  </div>
                )}
                <button onClick={() => { setAiResult(null); setAiError(""); }}
                  className="flex items-center gap-1 text-xs text-dim hover:text-soft">
                  <RefreshCw size={10} />Re-analyze
                </button>
              </div>
            )}
            {!aiResult && !aiLoading && !aiError && (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-ultra/10 border border-ultra/20 flex items-center justify-center">
                  <Brain size={24} className="text-ultra" />
                </div>
                <p className="font-bold text-white">Click &quot;Analyze with AI&quot; to get a breakdown</p>
                <p className="text-sm text-soft">Difficulty analysis, play style, tips, and more</p>
              </div>
            )}
          </div>
        )}

        {/* RECORDS */}
        {tab === "Records" && (
          <div>
            <p className="text-sm font-bold text-white mb-4">Top Records</p>

            {records.length > 0 ? (
              <div className="space-y-2 mb-5">
                {records.map((rec, i) => (
                  <div key={rec.user.id} className="flex items-center gap-3 p-3 bg-page border border-line rounded-xl">
                    <div className="w-7 text-center">
                      {i < 3
                        ? <span className="text-sm font-black" style={{ color: ["#ffd700","#c0c0c0","#cd7f32"][i] }}>#{i + 1}</span>
                        : <span className="text-sm text-dim">#{i + 1}</span>}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-xs font-bold text-soft flex-shrink-0">
                      {rec.user.avatar
                        ? <img src={rec.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        : rec.user.username[0].toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${rec.user.username}`} className="text-sm font-medium text-white truncate hover:underline block">
                        {rec.user.username}
                      </Link>
                      <p className="text-xs text-dim">{FLAGS[rec.user.country ?? ""] ?? <Globe size={10} className="inline" />} {rec.user.country ?? "Unknown"}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-0.5">
                      <div className="text-sm font-bold text-easy tabular-nums">{rec.accuracy.toFixed(2)}%</div>
                      {rec.cleared && <div className="text-[10px] text-ice font-bold">CLEARED</div>}
                      {rec.score !== undefined && rec.score > 0 && (
                        <div className="text-xs text-dim tabular-nums">{rec.score.toLocaleString()} pts</div>
                      )}
                      {(rec as MapRecord & { videoUrl?: string }).videoUrl && (
                        <a href={(rec as MapRecord & { videoUrl?: string }).videoUrl!} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5">
                          <Youtube size={9} />video
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 gap-2 text-center mb-5">
                <Trophy size={32} className="text-dim" />
                <p className="text-soft text-sm">No records yet — be the first!</p>
              </div>
            )}

            {/* Submit / Login */}
            <div className="pt-4 border-t border-line">
              {currentUser === undefined ? null : currentUser ? (
                <div>
                  {recSuccess && (
                    <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-easy/8 border border-easy/20 text-easy text-sm">
                      <CheckCircle size={14} />Record submitted successfully!
                    </div>
                  )}
                  <p className="text-sm font-bold text-white mb-3">Submit Your Record</p>
                  <form onSubmit={submitRecord} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-soft mb-1 block">Accuracy (%)</label>
                        <input type="number" step="0.01" min="0" max="100" required
                          value={recAcc} onChange={e => setRecAcc(e.target.value)}
                          placeholder="99.83"
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-soft mb-1 block">Score (optional)</label>
                        <input type="number" min="0"
                          value={recScore} onChange={e => setRecScore(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-soft mb-1 block flex items-center gap-1">
                        <Youtube size={10} />Gameplay Video URL <span className="text-fire ml-0.5">*</span>
                      </label>
                      <input type="url" required
                        value={recVideoUrl} onChange={e => setRecVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=… (required)"
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-soft mb-1 block">Note (optional)</label>
                      <input type="text" maxLength={200}
                        value={recNote} onChange={e => setRecNote(e.target.value)}
                        placeholder="First clear! NF mod used..."
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={recCleared} onChange={e => setRecCleared(e.target.checked)}
                        className="w-4 h-4 rounded border-line accent-fire" />
                      <span className="text-sm text-soft">Cleared (reached the end)</span>
                    </label>
                    {recError && <p className="text-xs text-fire">{recError}</p>}
                    <button type="submit" disabled={recLoading}
                      className="flex items-center gap-2 px-4 py-2 fire-btn text-sm disabled:opacity-50">
                      <Send size={13} />{recLoading ? "Submitting…" : "Submit Record"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-soft">Have a record? Log in to submit it.</p>
                  <div className="flex gap-2">
                    <Link href="/login"    className="px-4 py-2 text-sm border border-line rounded-xl text-soft hover:border-line-hi transition-colors">Log in</Link>
                    <Link href="/register" className="px-4 py-2 text-sm fire-btn">Sign Up</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
