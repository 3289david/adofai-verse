"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Download, Clock, Music, User, Calendar, Layers, Brain, BarChart2, Trophy, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { formatDuration, formatBpm, formatNumber, getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import type { MapData, AIAnalysisResult } from "@/lib/types";

const TABS = ["Overview", "BPM Chart", "AI Analysis", "Records"] as const;
type Tab = (typeof TABS)[number];

export default function MapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [map,       setMap]       = useState<MapData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<Tab>("Overview");
  const [liked,     setLiked]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult,  setAiResult]  = useState<AIAnalysisResult | null>(null);
  const [aiError,   setAiError]   = useState("");

  useEffect(() => {
    fetch(`/api/maps/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setMap(d); setLoading(false); })
      .catch(() => setLoading(false));
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

  const dc = getDifficultyColor(map.difficulty);

  async function runAI() {
    setAiLoading(true); setAiError("");
    try {
      const r = await fetch("/api/ai/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ map }) });
      if (!r.ok) throw new Error();
      setAiResult(await r.json());
    } catch { setAiError("AI analysis failed. Please try again."); }
    finally   { setAiLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/maps" className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Maps
      </Link>

      {/* Header */}
      <div className="bg-card border border-line rounded-xl p-6 mb-6" style={{ borderColor: `${dc}30` }}>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${dc}15`, border: `1px solid ${dc}30` }}>
            <Music size={28} style={{ color: dc, opacity: 0.7 }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <DifficultyBadge difficulty={map.difficulty} size="md" />
              {map.status === "FEATURED" && <span className="text-xs font-bold px-2 py-0.5 rounded bg-fire-2/15 text-fire-2 border border-fire-2/30">FEATURED</span>}
            </div>
            <h1 className="text-2xl font-black text-white mb-0.5">{map.title}</h1>
            <p className="text-soft mb-3">{map.artist}</p>
            <div className="flex flex-wrap gap-4 text-xs text-soft mb-4">
              <span className="flex items-center gap-1"><User size={11} /><Link href={`/profile/${map.creator.username}`} className="text-ice hover:underline">{map.creator.username}</Link></span>
              <span className="flex items-center gap-1"><Music size={11} />{formatBpm(map.bpmMin, map.bpmMax)}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{formatDuration(map.duration)}</span>
              <span className="flex items-center gap-1"><Layers size={11} />{map.tileCount.toLocaleString()} tiles</span>
              <span className="flex items-center gap-1"><Calendar size={11} />{new Date(map.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {map.downloadUrl && (
                <a href={map.downloadUrl} className="inline-flex items-center gap-1.5 px-4 py-2 fire-btn text-sm"><Download size={13} />Download</a>
              )}
              <button onClick={() => setLiked(!liked)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${liked ? "bg-fire/10 border-fire/30 text-fire" : "bg-page border-line text-soft hover:border-line-hi"}`}>
                <Heart size={13} fill={liked?"currentColor":"none"} />{formatNumber(map.likeCount + (liked ? 1 : 0))}
              </button>
            </div>
          </div>
          <div className="flex sm:flex-col gap-6 sm:gap-4 text-right">
            <div><div className="text-xl font-black text-fire-2">{formatNumber(map.playCount)}</div><div className="text-xs text-soft">Plays</div></div>
            <div><div className="text-xl font-black text-fire">{formatNumber(map.likeCount)}</div><div className="text-xs text-soft">Likes</div></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TABS.map(t => {
          const icons = { Overview: BarChart2, "BPM Chart": Music, "AI Analysis": Brain, Records: Trophy };
          const Icon = icons[t];
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${t === tab ? "bg-fire/10 border border-fire/25 text-fire" : "text-soft hover:text-white border border-transparent"}`}>
              <Icon size={13} />{t}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-card border border-line rounded-xl p-6">
        {tab === "Overview" && (
          <div>
            {map.description && <p className="text-soft text-sm leading-relaxed mb-6">{map.description}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Difficulty", val:<DifficultyBadge difficulty={map.difficulty} size="lg" />,      sub:getDifficultyLabel(map.difficulty), c:dc },
                { label:"BPM",        val:formatBpm(map.bpmMin,map.bpmMax),                               sub:map.bpmMin===map.bpmMax?"Constant":"Variable", c:"#0077ff" },
                { label:"Duration",   val:formatDuration(map.duration),                                   sub:"Total length",  c:"#cc44ff" },
                { label:"Tiles",      val:map.tileCount.toLocaleString(),                                 sub:"Total tiles",   c:"#44dd88" },
              ].map(({label,val,sub,c}) => (
                <div key={label} className="bg-page border border-line rounded-xl p-4" style={{borderColor:`${c}20`}}>
                  <p className="text-xs text-soft mb-1">{label}</p>
                  <div className="text-lg font-black" style={{color:c}}>{val}</div>
                  <p className="text-xs text-dim mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            {map.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {map.tags.map(t => <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-line text-soft">{t}</span>)}
              </div>
            )}
          </div>
        )}

        {tab === "BPM Chart" && (
          <div>
            <p className="text-sm font-bold text-white mb-6">BPM Over Time</p>
            {map.bpmData?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={map.bpmData} margin={{top:5,right:5,bottom:5,left:0}}>
                  <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0077ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0077ff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" />
                  <XAxis dataKey="time" tickFormatter={v=>`${v}s`} tick={{fill:"#6666aa",fontSize:11}} axisLine={{stroke:"#1e1e40"}} tickLine={false} />
                  <YAxis tick={{fill:"#6666aa",fontSize:11}} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{background:"#111127",border:"1px solid #1e1e40",borderRadius:8,fontSize:12}} labelStyle={{color:"#6666aa"}} itemStyle={{color:"#0077ff"}} />
                  <Area type="monotone" dataKey="bpm" stroke="#0077ff" strokeWidth={2} fill="url(#bg)" dot={{fill:"#0077ff",r:3,strokeWidth:0}} activeDot={{r:5,fill:"#00ccff",strokeWidth:0}} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-dim">No BPM data</div>}
          </div>
        )}

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
                  style={{background:"linear-gradient(135deg,#cc44ff,#0077ff)"}}>
                  {aiLoading ? "Analyzing…" : "Analyze with AI"}
                </button>
              )}
            </div>

            {aiLoading && <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:"#cc44ff",borderTopColor:"transparent"}} /></div>}
            {aiError   && <div className="p-4 rounded-xl bg-fire/8 border border-fire/20 text-fire text-sm">{aiError}</div>}

            {aiResult && !aiLoading && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-page border border-line">
                  <p className="text-xs text-soft font-bold mb-1">PLAY STYLE</p>
                  <p className="text-base font-bold text-white">{aiResult.play_style}</p>
                </div>
                <div className="p-4 rounded-xl bg-page border border-line">
                  <p className="text-xs text-soft font-bold mb-2">WHY IT&#39;S HARD</p>
                  <p className="text-sm text-white leading-relaxed">{aiResult.difficulty_explanation}</p>
                </div>
                <div className="p-4 rounded-xl bg-page border border-line">
                  <p className="text-xs text-soft font-bold mb-3">TIPS</p>
                  <ul className="space-y-2">
                    {aiResult.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white">
                        <span className="w-5 h-5 rounded-full bg-fire-2/15 text-fire-2 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
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
                <button onClick={() => {setAiResult(null);setAiError("");}} className="text-xs text-dim hover:text-soft">Re-analyze</button>
              </div>
            )}

            {!aiResult && !aiLoading && !aiError && (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-ultra/10 border border-ultra/20 flex items-center justify-center">
                  <Brain size={24} className="text-ultra" />
                </div>
                <p className="font-bold text-white">Click &#34;Analyze with AI&#34; to get a breakdown</p>
                <p className="text-sm text-soft">Difficulty analysis, play style, tips, and more</p>
              </div>
            )}
          </div>
        )}

        {tab === "Records" && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <Trophy size={36} className="text-dim" />
            <p className="text-soft">No records yet — be the first!</p>
            <Link href="/register" className="mt-2 px-5 py-2 fire-btn text-sm">Sign Up to Submit</Link>
          </div>
        )}
      </div>
    </div>
  );
}
