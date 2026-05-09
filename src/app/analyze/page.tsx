"use client";

import { useState } from "react";
import { Upload, BarChart2, Music, AlertCircle, Zap, TrendingUp, List } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line,
} from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { getDifficultyColor, formatDuration } from "@/lib/utils";

interface BpmChange { floor: number; time: number; bpm: number; }

interface Result {
  title:       string;
  artist:      string;
  bpmMin:      number;
  bpmMax:      number;
  tileCount:   number;
  duration:    number;
  difficulty:  number;
  bpmData:     { time: number; bpm: number }[];
  sections:    { name: string; diff: number; bpm: number }[];
  changes:     BpmChange[];
  patterns:    string[];
  note:        string;
}

function parseAdofai(content: string, filename: string): Result {
  const d = JSON.parse(content);
  const initialBpm: number = d.settings?.bpm ?? 120;
  const title  = d.settings?.song    ?? filename.replace(/\.[^.]+$/, "");
  const artist = d.settings?.artist  ?? "Unknown";

  const angleData: number[] = Array.isArray(d.angleData) ? d.angleData : [];
  const pathData: string    = typeof d.pathData === "string" ? d.pathData : "";
  const tiles = angleData.length || pathData.replace(/[^ruledpcmtfjxq]/gi, "").length || 0;

  // Parse BPM changes from actions
  type RawAction = { floor: number; eventType: string; speedType?: string; beatsPerMinute?: number; bpmMultiplier?: number; };
  const speedActions: RawAction[] = (d.actions ?? [])
    .filter((a: RawAction) => a.eventType === "SetSpeed")
    .sort((a: RawAction, b: RawAction) => a.floor - b.floor);

  const bpmData: { time: number; bpm: number }[] = [{ time: 0, bpm: Math.round(initialBpm) }];
  const changes: BpmChange[] = [];
  let currentBpm = initialBpm;
  let currentTime = 0;
  let lastFloor = 0;
  let bpmMin = initialBpm;
  let bpmMax = initialBpm;

  for (const action of speedActions) {
    const floor = Math.min(action.floor, tiles);
    const elapsed = floor - lastFloor;
    if (elapsed > 0) currentTime += elapsed * (60 / currentBpm);

    if (action.speedType === "Multiplier") {
      currentBpm = currentBpm * (action.bpmMultiplier ?? 1);
    } else {
      currentBpm = action.beatsPerMinute ?? currentBpm;
    }

    bpmMin = Math.min(bpmMin, currentBpm);
    bpmMax = Math.max(bpmMax, currentBpm);

    const point = { time: Math.round(currentTime), bpm: Math.round(currentBpm) };
    bpmData.push(point);
    changes.push({ floor, time: Math.round(currentTime), bpm: Math.round(currentBpm) });
    lastFloor = floor;
  }

  const remainingTiles = Math.max(0, tiles - lastFloor);
  const duration = Math.round(currentTime + remainingTiles * (60 / currentBpm));
  bpmData.push({ time: duration, bpm: Math.round(currentBpm) });

  // Difficulty estimate: weighted by max BPM and tile density
  const tilesPerMinute = tiles / Math.max(1, duration) * 60;
  const bpmScore = Math.log2(Math.max(60, bpmMax) / 60) * 4;
  const densityScore = Math.min(6, tilesPerMinute / 80);
  const changeScore = Math.min(3, changes.length / 5);
  const difficulty = Math.min(21, Math.max(1, Math.round(bpmScore + densityScore + changeScore)));

  // Sections: divide into 6 parts, estimate difficulty per section
  const SECTIONS = 6;
  const sections = Array.from({ length: SECTIONS }, (_, i) => {
    const sectionStart = Math.floor(i * tiles / SECTIONS);
    const sectionEnd   = Math.floor((i + 1) * tiles / SECTIONS);
    // find BPM active in this section
    let sectionBpm = initialBpm;
    for (const c of changes) {
      if (c.floor <= sectionStart) sectionBpm = c.bpm;
    }
    const secDensity = (sectionEnd - sectionStart) / Math.max(1, duration / SECTIONS) * 60;
    const secDiff = Math.min(21, Math.max(1, Math.round(
      Math.log2(Math.max(60, sectionBpm) / 60) * 4 + Math.min(4, secDensity / 100)
    )));
    const labels = ["Intro", "Early", "Mid", "Pre-Drop", "Drop", "Outro"];
    return { name: labels[i] ?? `S${i + 1}`, diff: secDiff, bpm: Math.round(sectionBpm) };
  });

  // Pattern detection
  const patterns: string[] = [];
  if (bpmMax >= 300) patterns.push("High BPM");
  if (bpmMax / Math.max(1, bpmMin) >= 2) patterns.push("BPM Doubles");
  if (changes.length >= 8) patterns.push("Complex Transitions");
  if (changes.length === 0) patterns.push("Constant BPM");
  if (tilesPerMinute > 300) patterns.push("Dense Spam");
  if (bpmMax - bpmMin > 100) patterns.push("Wide BPM Range");

  const note = changes.length > 0
    ? `${changes.length} BPM change${changes.length > 1 ? "s" : ""} detected. Peak: ${Math.round(bpmMax)} BPM.`
    : `Constant ${Math.round(initialBpm)} BPM — ${tiles} tiles.`;

  return {
    title, artist,
    bpmMin: Math.round(bpmMin), bpmMax: Math.round(bpmMax),
    tileCount: tiles, duration, difficulty,
    bpmData, sections, changes, patterns, note,
  };
}

export default function AnalyzePage() {
  const [drag,   setDrag]   = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy,   setBusy]   = useState(false);
  const [tab,    setTab]    = useState<"bpm" | "sections" | "changes">("bpm");

  function parseFile(file: File) {
    setBusy(true);
    const r = new FileReader();
    r.onload = e => {
      try {
        const res = parseAdofai(e.target?.result as string, file.name);
        setResult(res);
      } catch {
        alert("Could not parse file. Make sure it is a valid .adofai file.");
      } finally {
        setBusy(false);
      }
    };
    r.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Map Analyzer</h1>
        <p className="text-sm text-soft mt-1">Upload a .adofai file to get full BPM, difficulty, and pattern analysis</p>
      </div>

      {/* Privacy notice */}
      <div className="mb-5 flex gap-2.5 p-3 rounded-xl text-xs text-soft leading-relaxed" style={{ background: "rgba(0,119,255,0.06)", border: "1px solid rgba(0,119,255,0.15)" }}>
        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#0077ff" }} />
        <p>
          <strong className="text-white">Your file never leaves your device.</strong>{" "}
          Analysis runs entirely in your browser. The .adofai file is read locally and discarded immediately — nothing is uploaded to our servers.
        </p>
      </div>

      {!result && (
        <div>
          <label htmlFor="file-upload"
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }}
            className={`block cursor-pointer border-2 border-dashed rounded-xl p-16 text-center transition-colors ${drag ? "border-fire/50 bg-fire/5" : "border-line hover:border-line-hi"}`}>
            <Upload size={36} className={`mx-auto mb-3 ${drag ? "text-fire" : "text-dim"}`} />
            <p className="font-bold text-white mb-1">Drop your .adofai file here</p>
            <p className="text-sm text-soft">or <span className="text-fire">click to browse</span></p>
            <p className="text-xs text-dim mt-2">Parses BPM changes, difficulty, tile density, patterns</p>
          </label>
          <input id="file-upload" type="file" accept=".adofai,.json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />
        </div>
      )}

      {busy && (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-fire-2" />
        </div>
      )}

      {result && !busy && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="flex items-center justify-between p-4 bg-card border border-line rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-fire-2/12 border border-fire-2/25 flex items-center justify-center">
                <Music size={16} className="text-fire-2" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">{result.title}</p>
                <p className="text-xs text-soft">{result.artist}</p>
              </div>
            </div>
            <button onClick={() => setResult(null)}
              className="text-xs text-soft border border-line px-3 py-1.5 rounded-lg hover:border-line-hi transition-colors">
              Analyze another
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Difficulty", val: <DifficultyBadge difficulty={result.difficulty} size="lg" />, c: getDifficultyColor(result.difficulty) },
              { label: "BPM",        val: result.bpmMin === result.bpmMax ? `${result.bpmMin}` : `${result.bpmMin}–${result.bpmMax}`, c: "#0077ff" },
              { label: "Tiles",      val: result.tileCount.toLocaleString(), c: "#cc44ff" },
              { label: "Duration",   val: formatDuration(result.duration),   c: "#44dd88" },
            ].map(({ label, val, c }) => (
              <div key={label} className="bg-card border border-line rounded-xl p-4" style={{ borderColor: `${c}22` }}>
                <p className="text-xs text-soft mb-1">{label}</p>
                <div className="text-lg font-black" style={{ color: c }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Patterns */}
          {result.patterns.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-card border border-line rounded-xl">
              <Zap size={13} className="text-fire-2 flex-shrink-0 mt-0.5" />
              {result.patterns.map(p => (
                <span key={p} className="text-xs px-2 py-0.5 rounded-md bg-fire-2/10 border border-fire-2/20 text-fire-2">{p}</span>
              ))}
            </div>
          )}

          {/* Note */}
          {result.note && (
            <div className="flex gap-3 p-4 rounded-xl bg-fire-2/6 border border-fire-2/18">
              <AlertCircle size={15} className="text-fire-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">{result.note}</p>
            </div>
          )}

          {/* Chart tabs */}
          <div className="bg-card border border-line rounded-xl p-5">
            <div className="flex gap-2 mb-5">
              {(["bpm", "sections", "changes"] as const).map(t => {
                const icons = { bpm: Music, sections: BarChart2, changes: List };
                const labels = { bpm: "BPM Timeline", sections: "Sections", changes: "Speed Changes" };
                const Icon = icons[t];
                return (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      tab === t ? "bg-fire/10 border border-fire/20 text-fire" : "text-soft hover:text-white"
                    }`}>
                    <Icon size={11} />{labels[t]}
                  </button>
                );
              })}
            </div>

            {tab === "bpm" && (
              <>
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Music size={13} className="text-ice" />BPM Over Time
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.bpmData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0077ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0077ff" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" />
                    <XAxis dataKey="time" tickFormatter={v => `${v}s`} tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={{ stroke: "#1e1e40" }} tickLine={false} />
                    <YAxis tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip contentStyle={{ background: "#111127", border: "1px solid #1e1e40", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#6666aa" }} itemStyle={{ color: "#0077ff" }}
                      labelFormatter={v => `${v}s`} />
                    <Area type="monotone" dataKey="bpm" stroke="#0077ff" strokeWidth={2} fill="url(#g)"
                      dot={{ fill: "#0077ff", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00ccff", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}

            {tab === "sections" && (
              <>
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart2 size={13} className="text-fire-2" />Section Difficulty
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.sections} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 21]} tick={{ fill: "#6666aa", fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip contentStyle={{ background: "#111127", border: "1px solid #1e1e40", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#6666aa" }} cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      formatter={(val, _, props) => [`${val} (${props.payload.bpm} BPM)`, "Difficulty"]} />
                    <Bar dataKey="diff" radius={[4, 4, 0, 0]}>
                      {result.sections.map((s, i) => <Cell key={i} fill={getDifficultyColor(s.diff)} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

            {tab === "changes" && (
              <div>
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={13} className="text-ultra" />Speed Changes
                </p>
                {result.changes.length === 0 ? (
                  <p className="text-soft text-sm py-8 text-center">No BPM changes — constant {result.bpmMin} BPM throughout.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {result.changes.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-page border border-line rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-dim w-6 text-right">#{i + 1}</span>
                          <span className="text-soft">Tile {c.floor.toLocaleString()}</span>
                          <span className="text-xs text-dim">at {c.time}s</span>
                        </div>
                        <span className="font-bold tabular-nums" style={{ color: getDifficultyColor(Math.min(21, Math.round(Math.log2(c.bpm / 60) * 4))) }}>
                          {c.bpm} BPM
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BPM Line chart for multi-change maps */}
          {result.changes.length >= 3 && (
            <div className="bg-card border border-line rounded-xl p-5">
              <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={13} className="text-ultra" />BPM Progression
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={result.changes} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" />
                  <XAxis dataKey="floor" tickFormatter={v => `T${v}`} tick={{ fill: "#6666aa", fontSize: 10 }} axisLine={{ stroke: "#1e1e40" }} tickLine={false} />
                  <YAxis tick={{ fill: "#6666aa", fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip contentStyle={{ background: "#111127", border: "1px solid #1e1e40", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#6666aa" }} itemStyle={{ color: "#cc44ff" }}
                    labelFormatter={v => `Tile ${v}`} />
                  <Line type="stepAfter" dataKey="bpm" stroke="#cc44ff" strokeWidth={2}
                    dot={{ fill: "#cc44ff", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
