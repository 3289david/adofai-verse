"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Heart, Download, Clock, Music, User, Layers,
  Brain, BarChart2, Trophy, Loader2, Youtube, ExternalLink, Play,
  RefreshCw, Shield, Globe, CheckCircle, Send, MessageCircle,
  Share2, Link2, Copy, Check,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import {
  formatDuration, formatBpm, formatNumber,
  getDifficultyColor, getDifficultyLabel,
} from "@/lib/utils";
import type { MapData, MapRecord, AIAnalysisResult, AuthUser, CommentData } from "@/lib/types";

const FLAGS: Record<string, string> = {
  KR: "🇰🇷", JP: "🇯🇵", US: "🇺🇸", CN: "🇨🇳", GB: "🇬🇧",
  AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷", CA: "🇨🇦", BR: "🇧🇷",
  RU: "🇷🇺", PL: "🇵🇱", SE: "🇸🇪", NL: "🇳🇱", IT: "🇮🇹",
};

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

const SOURCE_LABEL: Record<string, string> = { "adofaigg:": "adofai.gg", "steam:": "Steam Workshop" };
function sourceLabel(externalId?: string | null) {
  if (!externalId) return null;
  for (const [prefix, label] of Object.entries(SOURCE_LABEL)) {
    if (externalId.startsWith(prefix)) return label;
  }
  return null;
}

function estimateDuration(tileCount: number, bpmMin: number, bpmMax: number): number {
  if (tileCount <= 0) return 0;
  const avg = bpmMin > 0 && bpmMax > 0 ? (bpmMin + bpmMax) / 2 : bpmMax > 0 ? bpmMax : bpmMin > 0 ? bpmMin : 120;
  return Math.round(tileCount * 60 / avg);
}

const TABS = ["Overview", "Records", "Comments"] as const;
type Tab = typeof TABS[number];

export default function MapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [map, setMap] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("Overview");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState("");

  const [recAcc, setRecAcc] = useState("");
  const [recVideoUrl, setRecVideoUrl] = useState("");
  const [recCleared, setRecCleared] = useState(false);
  const [recScore, setRecScore] = useState("");
  const [recNote, setRecNote] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [recSuccess, setRecSuccess] = useState(false);
  const [recError, setRecError] = useState("");
  const [records, setRecords] = useState<MapRecord[]>([]);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editDiff, setEditDiff] = useState(0);
  const [editBpmMin, setEditBpmMin] = useState(0);
  const [editBpmMax, setEditBpmMax] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [editVideo, setEditVideo] = useState("");
  const [editDown, setEditDown] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoad, setCommentLoad] = useState(false);
  const [commentPost, setCommentPost] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [similarMaps, setSimilarMaps] = useState<MapData[]>([]);
  const [showBpm, setShowBpm] = useState(false);

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

  useEffect(() => {
    if (tab === "Comments" && comments.length === 0) {
      setCommentLoad(true);
      fetch(`/api/maps/${id}/comments`)
        .then(r => r.json())
        .then(d => setComments(d.comments ?? []))
        .catch(() => {})
        .finally(() => setCommentLoad(false));
    }
  }, [tab, id, comments.length]);

  useEffect(() => {
    fetch(`/api/maps/${id}/similar`).then(r => r.ok ? r.json() : []).then(d => setSimilarMaps(Array.isArray(d) ? d : [])).catch(() => {});
  }, [id]);

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(null), 2000); });
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 size={28} className="text-soft animate-spin" /></div>;
  if (!map) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-lg font-bold text-white">Map not found</p>
      <Link href="/maps" className="text-fire text-sm hover:underline">← Back to Maps</Link>
    </div>
  );

  const dc = getDifficultyColor(map.difficulty);
  const ytId = map.videoUrl ? getYouTubeId(map.videoUrl) : null;
  const hasBpm = (map.bpmData?.length ?? 0) > 0 || map.bpmMin > 0;
  const src = sourceLabel(map.externalId);
  const displayCreator = map.creatorName || map.creator.username;
  const estDur = map.duration > 0 ? map.duration : estimateDuration(map.tileCount, map.bpmMin, map.bpmMax);
  const displayDuration = map.duration > 0 ? formatDuration(map.duration) : map.tileCount > 0 ? formatDuration(estDur) + " ~" : "—";
  const bpmChartData = map.bpmData ?? (map.bpmMin > 0 ? [{ time: 0, bpm: map.bpmMin }, { time: estDur, bpm: map.bpmMax > map.bpmMin ? map.bpmMax : map.bpmMin }] : []);
  const canEdit = currentUser && (currentUser.id === map.creator.id || currentUser.role === "ADMIN" || currentUser.role === "MODERATOR");

  async function toggleLike() {
    if (!currentUser) { window.location.href = "/login"; return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try { const r = await fetch(`/api/maps/${id}/like`, { method: "POST" }); if (r.ok) { const d = await r.json(); setLiked(d.liked); setLikeCount(d.likeCount); } } finally { setLikeLoading(false); }
  }

  function startEdit() {
    if (!map) return;
    setEditTitle(map.title); setEditArtist(map.artist); setEditDiff(map.difficulty);
    setEditBpmMin(map.bpmMin); setEditBpmMax(map.bpmMax); setEditDesc(map.description ?? "");
    setEditVideo(map.videoUrl ?? ""); setEditDown(map.downloadUrl ?? "");
    setEditing(true); setEditError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); setEditSaving(true); setEditError("");
    try {
      const res = await fetch(`/api/maps/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), artist: editArtist.trim(), difficulty: Number(editDiff), bpmMin: Number(editBpmMin), bpmMax: Number(editBpmMax), description: editDesc.trim() || null, videoUrl: editVideo.trim() || null, downloadUrl: editDown.trim() || null }) });
      if (!res.ok) { const d = await res.json(); setEditError(d.error ?? "Save failed."); return; }
      setMap(await res.json()); setEditing(false);
    } catch { setEditError("Network error."); } finally { setEditSaving(false); }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault(); if (!commentText.trim() || commentPost) return; setCommentPost(true);
    try { const r = await fetch(`/api/maps/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: commentText.trim() }) });
      if (r.ok) { const c = await r.json(); setComments(prev => [c, ...prev]); setCommentText(""); }
    } catch {} finally { setCommentPost(false); }
  }

  async function runAI() {
    setAiLoading(true); setAiError("");
    try { const r = await fetch("/api/ai/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ map }) });
      if (!r.ok) throw new Error(); setAiResult(await r.json());
    } catch { setAiError("AI analysis failed. Please try again."); } finally { setAiLoading(false); }
  }

  async function submitRecord(e: React.FormEvent) {
    e.preventDefault(); setRecLoading(true); setRecError(""); setRecSuccess(false);
    try {
      const acc = parseFloat(recAcc);
      if (isNaN(acc) || acc < 0 || acc > 100) { setRecError("Accuracy must be between 0 and 100."); return; }
      if (!recVideoUrl.trim()) { setRecError("A gameplay video URL is required."); return; }
      const res = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapId: id, accuracy: acc, cleared: recCleared, score: recScore ? parseInt(recScore) : 0, note: recNote || null, videoUrl: recVideoUrl.trim() }) });
      if (!res.ok) { const data = await res.json(); setRecError(data.error ?? "Submission failed."); return; }
      setRecSuccess(true);
      const updated = await fetch(`/api/maps/${id}`).then(r => r.ok ? r.json() : null);
      if (updated?.records) setRecords(updated.records);
      setRecAcc(""); setRecScore(""); setRecNote(""); setRecCleared(false); setRecVideoUrl("");
    } catch { setRecError("Network error."); } finally { setRecLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/maps" className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-white mb-5 transition-colors">
        <ArrowLeft size={14} />Maps
      </Link>

      {/* ── Compact Header ── */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ background: `${dc}18`, borderColor: `${dc}40` }}>
            {map.coverImage ? <img src={map.coverImage} alt="" className="w-full h-full rounded-xl object-cover" /> : <Music size={24} style={{ color: dc }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <DifficultyBadge difficulty={map.difficulty} size="md" />
              {src && <span className="text-[10px] px-1.5 py-0.5 rounded bg-line text-dim">{src}</span>}
              {map.status === "FEATURED" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-fire-2/15 text-fire-2">FEATURED</span>}
            </div>
            <h1 className="text-xl font-black text-white leading-tight">{map.title}</h1>
            <p className="text-sm text-soft">{map.artist}</p>
          </div>
          <div className="flex-shrink-0 text-right hidden sm:block">
            <div className="text-lg font-black text-fire">{formatNumber(likeCount)}</div>
            <div className="text-[10px] text-soft">likes</div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-soft mb-4">
          <span className="flex items-center gap-1">
            <User size={11} />
            {map.creatorName ? <span className="text-white font-medium">{map.creatorName}</span> : <Link href={`/profile/${map.creator.username}`} className="text-ice hover:underline">{map.creator.username}</Link>}
          </span>
          {(map.bpmMin > 0 || map.bpmMax > 0) && <span className="flex items-center gap-1"><Music size={11} />{formatBpm(map.bpmMin, map.bpmMax)}</span>}
          <span className="flex items-center gap-1"><Clock size={11} />{displayDuration}</span>
          {map.tileCount > 0 && <span className="flex items-center gap-1"><Layers size={11} />{map.tileCount.toLocaleString()} tiles</span>}
          <span className="flex items-center gap-1"><Play size={11} />{formatNumber(map.playCount)} plays</span>
        </div>

        {/* Action buttons — single clean row */}
        <div className="flex flex-wrap items-center gap-2">
          {map.downloadUrl && (
            <a href={map.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 fire-btn text-sm">
              <Download size={13} />Download
            </a>
          )}
          {map.workshopUrl && (
            <a href={map.workshopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-line text-soft hover:border-line-hi hover:text-white transition-colors">
              <ExternalLink size={13} />Workshop
            </a>
          )}
          <button onClick={toggleLike} disabled={likeLoading}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors disabled:opacity-60 ${liked ? "bg-fire/10 border-fire/30 text-fire" : "border-line text-soft hover:border-line-hi"}`}>
            <Heart size={13} fill={liked ? "currentColor" : "none"} />{formatNumber(likeCount)}
          </button>

          {/* Share dropdown */}
          <div className="relative">
            <button onClick={() => setShareOpen(!shareOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-line text-soft hover:border-line-hi transition-colors">
              <Share2 size={13} />Share
            </button>
            {shareOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 py-1 rounded-xl z-10"
                style={{ background: "rgba(16,16,30,0.98)", border: "1px solid rgba(26,26,53,0.8)" }}>
                <button onClick={() => { copyText(window.location.href, "link"); setShareOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:text-white hover:bg-white/5 transition-colors">
                  <Link2 size={13} />{copied === "link" ? "Copied!" : "Copy Link"}
                </button>
                <button onClick={() => {
                  const text = `Check out "${map.title}" by ${map.artist} on ADOFAI.NET!`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
                  setShareOpen(false);
                }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:text-white hover:bg-white/5 transition-colors">
                  <Share2 size={13} />Twitter / X
                </button>
                <button onClick={() => {
                  copyText(`**${map.title}** by ${map.artist} (Lv.${map.difficulty.toFixed(1)}) — ${window.location.href}`, "discord");
                  setShareOpen(false);
                }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:text-white hover:bg-white/5 transition-colors">
                  <Copy size={13} />{copied === "discord" ? "Copied!" : "Discord"}
                </button>
              </div>
            )}
          </div>

          {canEdit && !editing && (
            <button onClick={startEdit} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-line text-dim hover:text-soft hover:border-line-hi transition-colors ml-auto">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M8 1.5l1.5 1.5L3 9.5H1.5V8L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Edit
            </button>
          )}
        </div>

        {/* Tags */}
        {map.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {map.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-lg bg-line text-soft">{t}</span>)}
          </div>
        )}
      </div>

      {/* ── Edit form (inline, no tab) ── */}
      {editing && (
        <form onSubmit={saveEdit} className="mb-6 bg-card border border-line rounded-xl p-5 space-y-3">
          <p className="text-sm font-bold text-white">Edit Map Info</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-soft mb-1 block">Title</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required maxLength={200} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-soft mb-1 block">Artist</label>
              <input value={editArtist} onChange={e => setEditArtist(e.target.value)} required maxLength={200} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-soft mb-1 block">Difficulty</label>
              <input type="number" min={0} max={21} step={0.1} value={editDiff} onChange={e => setEditDiff(+e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-soft mb-1 block">BPM Min</label>
              <input type="number" min={0} value={editBpmMin} onChange={e => setEditBpmMin(+e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-soft mb-1 block">BPM Max</label>
              <input type="number" min={0} value={editBpmMax} onChange={e => setEditBpmMax(+e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-soft mb-1 block">Video URL</label>
            <input type="url" value={editVideo} onChange={e => setEditVideo(e.target.value)} placeholder="https://youtube.com/watch?v=…" className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
          </div>
          <div>
            <label className="text-xs text-soft mb-1 block">Download URL</label>
            <input type="url" value={editDown} onChange={e => setEditDown(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none" />
          </div>
          <div>
            <label className="text-xs text-soft mb-1 block">Description</label>
            <textarea rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={1000} className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none resize-none" />
          </div>
          {editError && <p className="text-xs text-fire">{editError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={editSaving} className="px-4 py-2 fire-btn text-sm disabled:opacity-50">{editSaving ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-line rounded-xl text-sm text-soft hover:border-line-hi transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* ── Video embed (always visible if available) ── */}
      {ytId && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} title={`${map.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0" />
        </div>
      )}

      {/* ── Inline sections (no heavy tab switching) ── */}

      {/* Description */}
      {map.description && <p className="text-sm text-soft leading-relaxed mb-6">{map.description}</p>}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: "Difficulty", val: getDifficultyLabel(map.difficulty), c: dc },
          { label: "BPM", val: map.bpmMin > 0 ? formatBpm(map.bpmMin, map.bpmMax) : "—", c: "#0077ff" },
          { label: "Duration", val: displayDuration, c: "#cc44ff" },
          { label: "Tiles", val: map.tileCount > 0 ? map.tileCount.toLocaleString() : "—", c: "#44dd88" },
        ].map(({ label, val, c }) => (
          <div key={label} className="bg-card border border-line rounded-xl p-3 text-center" style={{ borderColor: `${c}15` }}>
            <p className="text-[10px] text-soft mb-0.5">{label}</p>
            <p className="text-sm font-bold" style={{ color: c }}>{val}</p>
          </div>
        ))}
      </div>

      {/* BPM Chart toggle */}
      {hasBpm && (
        <div className="mb-6">
          <button onClick={() => setShowBpm(!showBpm)} className="flex items-center gap-1.5 text-xs text-soft hover:text-white mb-2 transition-colors">
            <BarChart2 size={12} />{showBpm ? "Hide BPM Chart" : "Show BPM Chart"}
            {!map.bpmData && map.bpmMin > 0 && <span className="text-[10px] text-dim ml-1">(estimated)</span>}
          </button>
          {showBpm && (
            <div className="bg-card border border-line rounded-xl p-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bpmChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs><linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0077ff" stopOpacity={0.25} /><stop offset="95%" stopColor="#0077ff" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" />
                  <XAxis dataKey="time" tickFormatter={v => `${v}s`} tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={{ stroke: "#1e1e40" }} tickLine={false} />
                  <YAxis tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "#111127", border: "1px solid #1e1e40", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#6666aa" }} itemStyle={{ color: "#0077ff" }} />
                  <Area type="monotone" dataKey="bpm" stroke="#0077ff" strokeWidth={2} fill="url(#bpmGrad)" dot={{ fill: "#0077ff", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00ccff", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis — inline collapsible */}
      <div className="mb-6 bg-card border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Brain size={15} style={{ color: "#cc44ff" }} />
            <p className="text-sm font-bold text-white">AI Analysis</p>
          </div>
          {!aiResult && (
            <button onClick={runAI} disabled={aiLoading} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#cc44ff,#0077ff)" }}>
              {aiLoading ? "Analyzing…" : "Analyze"}
            </button>
          )}
        </div>
        <p className="text-xs text-dim mb-3">Powered by Pollinations AI</p>
        {aiLoading && <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#cc44ff", borderTopColor: "transparent" }} /></div>}
        {aiError && <p className="text-xs text-fire">{aiError}</p>}
        {aiResult && !aiLoading && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 p-3 rounded-lg bg-page border border-line">
                <p className="text-[10px] text-soft font-bold mb-1">PLAY STYLE</p>
                <p className="text-sm font-bold text-white">{aiResult.play_style}</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-page border border-line">
                <p className="text-[10px] text-soft font-bold mb-1">HARDEST SECTION</p>
                <p className="text-sm text-fire">{aiResult.hardest_section}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-page border border-line">
              <p className="text-[10px] text-soft font-bold mb-1">WHY IT&apos;S HARD</p>
              <p className="text-xs text-white leading-relaxed">{aiResult.difficulty_explanation}</p>
            </div>
            <div className="p-3 rounded-lg bg-page border border-line">
              <p className="text-[10px] text-soft font-bold mb-2">TIPS</p>
              <ul className="space-y-1.5">
                {aiResult.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white">
                    <span className="w-4 h-4 rounded-full bg-fire-2/15 text-fire-2 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            {aiResult.recommended_for && (
              <p className="text-xs text-dim">Recommended for: <span className="text-easy">{aiResult.recommended_for}</span></p>
            )}
            {aiResult.practice_advice && (
              <div className="p-3 rounded-lg bg-page border border-line">
                <p className="text-[10px] text-soft font-bold mb-1">PRACTICE ADVICE</p>
                <p className="text-xs text-white leading-relaxed">{aiResult.practice_advice}</p>
              </div>
            )}
            <button onClick={() => { setAiResult(null); setAiError(""); }} className="flex items-center gap-1 text-xs text-dim hover:text-soft"><RefreshCw size={10} />Re-analyze</button>
          </div>
        )}
        {!aiResult && !aiLoading && !aiError && <p className="text-xs text-dim">Click Analyze for difficulty breakdown, tips, and more.</p>}
      </div>

      {/* ── Tabs (Records / Comments only) ── */}
      <div className="flex gap-1 mb-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              t === tab ? "bg-fire/10 border border-fire/25 text-fire" : "text-soft hover:text-white border border-transparent"
            }`}>
            {t === "Overview" && <BarChart2 size={13} />}
            {t === "Records" && <Trophy size={13} />}
            {t === "Comments" && <MessageCircle size={13} />}
            {t}
            {t === "Records" && records.length > 0 && <span className="ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-line text-dim">{records.length}</span>}
            {t === "Comments" && comments.length > 0 && <span className="ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-line text-dim">{comments.length}</span>}
          </button>
        ))}
      </div>

      <div className="bg-card border border-line rounded-xl p-5">
        {/* OVERVIEW — creator info */}
        {tab === "Overview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-page border border-line rounded-xl">
              <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center font-bold text-sm text-soft flex-shrink-0">
                {displayCreator[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{displayCreator}</p>
                <p className="text-xs text-dim">{src ? `Imported from ${src}` : "Level creator"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-page border border-line rounded-xl">
                <p className="text-lg font-black text-fire-2">{formatNumber(map.playCount)}</p>
                <p className="text-[10px] text-soft">Plays</p>
              </div>
              <div className="p-3 bg-page border border-line rounded-xl">
                <p className="text-lg font-black text-fire">{formatNumber(likeCount)}</p>
                <p className="text-[10px] text-soft">Likes</p>
              </div>
              <div className="p-3 bg-page border border-line rounded-xl">
                <p className="text-lg font-black text-easy">{records.length}</p>
                <p className="text-[10px] text-soft">Records</p>
              </div>
            </div>
          </div>
        )}

        {/* RECORDS */}
        {tab === "Records" && (
          <div>
            {records.length > 0 ? (
              <div className="space-y-2 mb-5">
                {records.map((rec, i) => (
                  <div key={rec.user.id} className="flex items-center gap-3 p-3 bg-page border border-line rounded-xl">
                    <div className="w-6 text-center">
                      {i < 3
                        ? <span className="text-sm font-black" style={{ color: ["#ffd700","#c0c0c0","#cd7f32"][i] }}>#{i + 1}</span>
                        : <span className="text-xs text-dim">#{i + 1}</span>}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-line flex items-center justify-center text-xs font-bold text-soft flex-shrink-0">
                      {rec.user.avatar ? <img src={rec.user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : rec.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${rec.user.username}`} className="text-sm font-medium text-white truncate hover:underline block">{rec.user.username}</Link>
                      <p className="text-[10px] text-dim">{FLAGS[rec.user.country ?? ""] ?? ""} {rec.user.country ?? ""}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-0.5">
                      <div className="text-sm font-bold text-easy tabular-nums">{rec.accuracy.toFixed(2)}%</div>
                      {rec.cleared && <div className="text-[10px] text-ice font-bold">CLEARED</div>}
                      {rec.score !== undefined && rec.score > 0 && <div className="text-[10px] text-dim tabular-nums">{rec.score.toLocaleString()} pts</div>}
                      {(rec as MapRecord & { videoUrl?: string }).videoUrl && (
                        <a href={(rec as MapRecord & { videoUrl?: string }).videoUrl!} target="_blank" rel="noopener noreferrer" className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"><Youtube size={9} />video</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 gap-2 text-center mb-4">
                <Trophy size={28} className="text-dim" />
                <p className="text-soft text-sm">No records yet — be the first!</p>
              </div>
            )}

            <div className="pt-4 border-t border-line">
              {currentUser === undefined ? null : currentUser ? (
                <div>
                  {recSuccess && <div className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-easy/8 border border-easy/20 text-easy text-sm"><CheckCircle size={14} />Record submitted!</div>}
                  <p className="text-sm font-bold text-white mb-3">Submit Record</p>
                  <form onSubmit={submitRecord} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-soft mb-1 block">Accuracy (%)</label>
                        <input type="number" step="0.01" min="0" max="100" required value={recAcc} onChange={e => setRecAcc(e.target.value)} placeholder="99.83" className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-soft mb-1 block">Score</label>
                        <input type="number" min="0" value={recScore} onChange={e => setRecScore(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-soft mb-1 block flex items-center gap-1"><Youtube size={10} />Video URL <span className="text-fire">*</span></label>
                      <input type="url" required value={recVideoUrl} onChange={e => setRecVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-soft mb-1 block">Note</label>
                      <input type="text" maxLength={200} value={recNote} onChange={e => setRecNote(e.target.value)} placeholder="First clear!..." className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={recCleared} onChange={e => setRecCleared(e.target.checked)} className="w-4 h-4 rounded border-line accent-fire" />
                      <span className="text-sm text-soft">Cleared</span>
                    </label>
                    {recError && <p className="text-xs text-fire">{recError}</p>}
                    <button type="submit" disabled={recLoading} className="flex items-center gap-2 px-4 py-2 fire-btn text-sm disabled:opacity-50"><Send size={13} />{recLoading ? "Submitting…" : "Submit"}</button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-soft">Log in to submit a record.</p>
                  <div className="flex gap-2">
                    <Link href="/login" className="px-3 py-1.5 text-sm border border-line rounded-xl text-soft hover:border-line-hi transition-colors">Log in</Link>
                    <Link href="/register" className="px-3 py-1.5 text-sm fire-btn">Sign Up</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMMENTS */}
        {tab === "Comments" && (
          <div>
            {currentUser ? (
              <form onSubmit={postComment} className="mb-4">
                <textarea value={commentText} onChange={e => setCommentText(e.target.value)} maxLength={500} rows={2} required placeholder="Share your thoughts…"
                  className="w-full px-3 py-2 rounded-xl text-sm bg-page border border-line focus:border-fire text-white outline-none resize-none mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dim">{commentText.length}/500</span>
                  <button type="submit" disabled={commentPost || !commentText.trim()} className="px-3 py-1.5 fire-btn text-sm disabled:opacity-50 flex items-center gap-1.5"><Send size={12} />{commentPost ? "…" : "Post"}</button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4 p-3 bg-page border border-line rounded-xl mb-4">
                <p className="text-sm text-soft">Log in to comment.</p>
                <div className="flex gap-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm border border-line rounded-xl text-soft hover:border-line-hi transition-colors">Log in</Link>
                  <Link href="/register" className="px-3 py-1.5 text-sm fire-btn">Sign Up</Link>
                </div>
              </div>
            )}
            {commentLoad ? <div className="flex justify-center py-8"><Loader2 size={18} className="text-soft animate-spin" /></div>
            : comments.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-center">
                <MessageCircle size={24} className="text-dim" />
                <p className="text-soft text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3 p-3 bg-page border border-line rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-line flex items-center justify-center text-xs font-bold text-soft flex-shrink-0">
                      {c.user.avatar ? <img src={c.user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : c.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link href={`/profile/${c.user.username}`} className="text-sm font-medium text-white hover:underline">{c.user.username}</Link>
                        <span className="text-[10px] text-dim">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <p className="text-sm text-soft leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Similar Maps ── */}
      {similarMaps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-white mb-3">Similar Maps</h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {similarMaps.map(sm => {
              const smDc = getDifficultyColor(sm.difficulty);
              const smYt = sm.videoUrl ? (() => { const m = sm.videoUrl!.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/); return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null; })() : null;
              const thumb = sm.coverImage || smYt;
              return (
                <Link key={sm.id} href={`/maps/${sm.id}`} className="flex-shrink-0 w-40 group block rounded-xl overflow-hidden border transition-colors hover:border-opacity-60" style={{ background: "rgba(16,16,30,0.6)", borderColor: "rgba(26,26,53,0.8)" }}>
                  <div className="h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${smDc}15, #07070f)` }}>
                    {thumb ? <img src={thumb} alt={sm.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <div className="w-full h-full flex items-center justify-center"><Music size={20} style={{ color: smDc, opacity: 0.4 }} /></div>}
                    <div className="absolute bottom-1 left-1"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${smDc}22`, color: smDc, border: `1px solid ${smDc}40` }}>Lv.{sm.difficulty}</span></div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold truncate" style={{ color: "#f0f0ff" }}>{sm.title}</p>
                    <p className="text-[10px] truncate" style={{ color: "#7777aa" }}>{sm.artist}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
