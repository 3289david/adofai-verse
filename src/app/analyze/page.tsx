"use client";

import { useState } from "react";
import { Upload, BarChart2, Play, Layers, Music, AlertCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { getDifficultyColor, formatDuration } from "@/lib/utils";

interface AnalysisResult {
  title: string;
  artist: string;
  bpmMin: number;
  bpmMax: number;
  tileCount: number;
  duration: number;
  difficulty: number;
  bpmData: { time: number; bpm: number }[];
  sectionDifficulty: { section: string; difficulty: number }[];
  summary: string;
}

const DEMO_RESULT: AnalysisResult = {
  title: "Demo Map",
  artist: "Demo Artist",
  bpmMin: 120,
  bpmMax: 240,
  tileCount: 512,
  duration: 180,
  difficulty: 13,
  bpmData: [
    { time: 0, bpm: 120 }, { time: 20, bpm: 120 }, { time: 40, bpm: 160 },
    { time: 60, bpm: 200 }, { time: 80, bpm: 240 }, { time: 100, bpm: 200 },
    { time: 120, bpm: 120 }, { time: 140, bpm: 240 }, { time: 160, bpm: 240 },
    { time: 180, bpm: 120 },
  ],
  sectionDifficulty: [
    { section: "Intro", difficulty: 5 },
    { section: "Verse", difficulty: 9 },
    { section: "Pre-Chorus", difficulty: 12 },
    { section: "Chorus", difficulty: 16 },
    { section: "Drop", difficulty: 18 },
    { section: "Breakdown", difficulty: 8 },
    { section: "Outro", difficulty: 6 },
  ],
  summary:
    "This map features a gradual difficulty buildup with a brutal drop section. The BPM doubles from 120 to 240 at the main drop, requiring precise timing adjustments.",
};

export default function AnalyzePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  function loadDemo() {
    setLoading(true);
    setTimeout(() => {
      setResult(DEMO_RESULT);
      setLoading(false);
    }, 1000);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".adofai") || file.name.endsWith(".json"))) {
      parseFile(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }

  function parseFile(file: File) {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        const bpmEvents = data.actions?.filter((a: { eventType: string }) => a.eventType === "SetSpeed") ?? [];
        const bpmData = [{ time: 0, bpm: data.settings?.bpm ?? 120 }];
        let currentTime = 0;
        bpmEvents.forEach((ev: { floor: number; bpmMultiplier: number; speedType: string; beatsPerMinute: number }) => {
          currentTime += ev.floor * 0.5;
          bpmData.push({
            time: Math.round(currentTime),
            bpm:
              ev.speedType === "Multiplier"
                ? Math.round(bpmData[bpmData.length - 1].bpm * ev.bpmMultiplier)
                : ev.beatsPerMinute,
          });
        });

        const bpms = bpmData.map((d) => d.bpm);
        const tileCount = data.pathData?.length ?? data.angleData?.length ?? 0;

        setResult({
          title: data.settings?.song ?? file.name.replace(/\.[^.]+$/, ""),
          artist: data.settings?.artist ?? "Unknown Artist",
          bpmMin: Math.min(...bpms),
          bpmMax: Math.max(...bpms),
          tileCount,
          duration: Math.round((tileCount * 60) / (data.settings?.bpm ?? 120)),
          difficulty: Math.min(21, Math.max(1, Math.round(Math.log2(Math.max(...bpms) / 60) * 5 + tileCount / 100))),
          bpmData: bpmData.slice(0, 30),
          sectionDifficulty: [
            { section: "Start", difficulty: Math.round(bpms[0] / 25) },
            { section: "Mid", difficulty: Math.round(Math.max(...bpms) / 22) },
            { section: "End", difficulty: Math.round(bpms[bpms.length - 1] / 24) },
          ],
          summary: `Map parsed from file. Contains ${tileCount} tiles with BPM ranging from ${Math.min(...bpms)} to ${Math.max(...bpms)}.`,
        });
      } catch {
        alert("Could not parse file. Make sure it's a valid .adofai file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>
          Map Analyzer
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7777aa" }}>
          Upload an .adofai file to visualize BPM changes, difficulty, and patterns
        </p>
      </div>

      {!result && (
        <div
          className="mb-6"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label
            htmlFor="file-upload"
            className="block cursor-pointer"
          >
            <div
              className="border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300"
              style={{
                borderColor: isDragging ? "rgba(255,34,68,0.5)" : "rgba(26,26,53,0.8)",
                background: isDragging
                  ? "rgba(255,34,68,0.05)"
                  : "rgba(16,16,30,0.5)",
              }}
            >
              <Upload
                size={40}
                className="mx-auto mb-4"
                style={{ color: isDragging ? "#ff8888" : "#44445a" }}
              />
              <p className="text-base font-bold mb-1" style={{ color: isDragging ? "#ff8888" : "#f0f0ff" }}>
                Drop your .adofai file here
              </p>
              <p className="text-sm" style={{ color: "#7777aa" }}>
                or <span style={{ color: "#ff8800" }}>click to browse</span>
              </p>
              <p className="text-xs mt-3" style={{ color: "#44445a" }}>
                Supports .adofai and .json map files
              </p>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".adofai,.json"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(26,26,53,0.8)" }} />
            <span className="text-xs" style={{ color: "#44445a" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(26,26,53,0.8)" }} />
          </div>

          <button
            onClick={loadDemo}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "rgba(255,136,0,0.1)",
              border: "1px solid rgba(255,136,0,0.25)",
              color: "#ff8800",
            }}
          >
            {loading ? "Loading…" : "Try Demo Analysis"}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-12 h-12 rounded-full border-2 animate-spin"
            style={{ borderColor: "#ff8800", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "#7777aa" }}>
            Analyzing map…
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: "rgba(16,16,30,0.9)",
              border: "1px solid rgba(26,26,53,0.8)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,136,0,0.12)", border: "1px solid rgba(255,136,0,0.25)" }}
              >
                <Music size={18} style={{ color: "#ff8800" }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#f0f0ff" }}>
                  {result.title}
                </p>
                <p className="text-xs" style={{ color: "#7777aa" }}>
                  {result.artist}
                </p>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: "#7777aa", border: "1px solid rgba(26,26,53,0.8)" }}
            >
              Analyze another
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Difficulty", value: <DifficultyBadge difficulty={result.difficulty} size="lg" />, sub: "", color: getDifficultyColor(result.difficulty) },
              { label: "BPM Range", value: result.bpmMin === result.bpmMax ? result.bpmMin : `${result.bpmMin}–${result.bpmMax}`, sub: result.bpmMin !== result.bpmMax ? "Variable BPM" : "Constant", color: "#0099ff" },
              { label: "Tile Count", value: result.tileCount.toLocaleString(), sub: "Total tiles", color: "#cc44ff" },
              { label: "Duration", value: formatDuration(result.duration), sub: "Est. length", color: "#44dd88" },
            ].map(({ label, value, sub, color }) => (
              <div
                key={label}
                className="p-4 rounded-xl"
                style={{ background: "rgba(16,16,30,0.8)", border: `1px solid ${color}22` }}
              >
                <p className="text-xs mb-1" style={{ color: "#7777aa" }}>{label}</p>
                <div className="text-lg font-black" style={{ color }}>
                  {value}
                </div>
                {sub && <p className="text-xs mt-0.5" style={{ color: "#44445a" }}>{sub}</p>}
              </div>
            ))}
          </div>

          {result.summary && (
            <div
              className="flex gap-3 p-4 rounded-xl"
              style={{ background: "rgba(255,136,0,0.06)", border: "1px solid rgba(255,136,0,0.18)" }}
            >
              <AlertCircle size={16} style={{ color: "#ff8800", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm leading-relaxed" style={{ color: "#f0f0ff" }}>
                {result.summary}
              </p>
            </div>
          )}

          <div
            className="p-6 rounded-xl"
            style={{ background: "rgba(16,16,30,0.8)", border: "1px solid rgba(26,26,53,0.8)" }}
          >
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2" style={{ color: "#f0f0ff" }}>
              <Music size={14} style={{ color: "#0099ff" }} />
              BPM Timeline
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={result.bpmData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0099ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0099ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,53,0.6)" />
                <XAxis dataKey="time" tickFormatter={(v) => `${v}s`} tick={{ fill: "#7777aa", fontSize: 11 }} axisLine={{ stroke: "rgba(26,26,53,0.8)" }} tickLine={false} />
                <YAxis tick={{ fill: "#7777aa", fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(26,26,53,0.8)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#7777aa" }}
                  itemStyle={{ color: "#0099ff" }}
                />
                <Area type="monotone" dataKey="bpm" stroke="#0099ff" strokeWidth={2} fill="url(#bpmGrad)" dot={{ fill: "#0099ff", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#00ddff", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            className="p-6 rounded-xl"
            style={{ background: "rgba(16,16,30,0.8)", border: "1px solid rgba(26,26,53,0.8)" }}
          >
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2" style={{ color: "#f0f0ff" }}>
              <BarChart2 size={14} style={{ color: "#ff8800" }} />
              Section Difficulty
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={result.sectionDifficulty} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,53,0.6)" vertical={false} />
                <XAxis dataKey="section" tick={{ fill: "#7777aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 21]} tick={{ fill: "#7777aa", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(26,26,53,0.8)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#7777aa" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="difficulty" radius={[4, 4, 0, 0]}>
                  {result.sectionDifficulty.map((entry, index) => (
                    <Cell key={index} fill={getDifficultyColor(entry.difficulty)} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
