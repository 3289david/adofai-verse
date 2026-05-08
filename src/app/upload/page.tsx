"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Music, FileText, Tag, CheckCircle } from "lucide-react";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { getDifficultyColor, DIFFICULTY_TAGS } from "@/lib/utils";

interface ParsedFile {
  title:     string;
  artist:    string;
  bpmMin:    number;
  bpmMax:    number;
  tileCount: number;
  duration:  number;
  bpmData:   { time: number; bpm: number }[];
}

function parseAdofaiFile(content: string, filename: string): ParsedFile {
  const d = JSON.parse(content);
  const initialBpm: number = d.settings?.bpm ?? 120;
  const tiles = (Array.isArray(d.angleData) ? d.angleData.length : 0)
    || (typeof d.pathData === "string" ? d.pathData.replace(/[^ruledpcmtfjxq]/gi, "").length : 0);

  type RawAction = { floor: number; eventType: string; speedType?: string; beatsPerMinute?: number; bpmMultiplier?: number };
  const speedActions: RawAction[] = (d.actions ?? [])
    .filter((a: RawAction) => a.eventType === "SetSpeed")
    .sort((a: RawAction, b: RawAction) => a.floor - b.floor);

  const bpmData: { time: number; bpm: number }[] = [{ time: 0, bpm: Math.round(initialBpm) }];
  let currentBpm = initialBpm;
  let currentTime = 0;
  let lastFloor = 0;
  let bpmMin = initialBpm;
  let bpmMax = initialBpm;

  for (const action of speedActions) {
    const floor = Math.min(action.floor, tiles);
    currentTime += (floor - lastFloor) * (60 / currentBpm);
    currentBpm = action.speedType === "Multiplier"
      ? currentBpm * (action.bpmMultiplier ?? 1)
      : (action.beatsPerMinute ?? currentBpm);
    bpmMin = Math.min(bpmMin, currentBpm);
    bpmMax = Math.max(bpmMax, currentBpm);
    bpmData.push({ time: Math.round(currentTime), bpm: Math.round(currentBpm) });
    lastFloor = floor;
  }

  const duration = Math.round(currentTime + (tiles - lastFloor) * (60 / currentBpm));

  return {
    title:     d.settings?.song    ?? filename.replace(/\.[^.]+$/, ""),
    artist:    d.settings?.artist  ?? "Unknown",
    bpmMin:    Math.round(bpmMin),
    bpmMax:    Math.round(bpmMax),
    tileCount: tiles,
    duration,
    bpmData,
  };
}

export default function UploadPage() {
  const router = useRouter();
  const [me,           setMe]           = useState<{ username: string } | null | undefined>(undefined);
  const [drag,         setDrag]         = useState(false);
  const [parsed,       setParsed]       = useState<ParsedFile | null>(null);
  const [title,        setTitle]        = useState("");
  const [artist,       setArtist]       = useState("");
  const [difficulty,   setDifficulty]   = useState(0);
  const [videoUrl,     setVideoUrl]     = useState("");
  const [downloadUrl,  setDownloadUrl]  = useState("");
  const [description,  setDescription]  = useState("");
  const [tags,         setTags]         = useState<string[]>([]);
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [done,         setDone]         = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(setMe);
  }, []);

  function handleFile(file: File) {
    const r = new FileReader();
    r.onload = e => {
      try {
        const p = parseAdofaiFile(e.target?.result as string, file.name);
        setParsed(p);
        setTitle(p.title);
        setArtist(p.artist);
      } catch { alert("Invalid .adofai file."); }
    };
    r.readAsText(file);
  }

  function handleCover(file: File) {
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) { setError("Title and artist are required."); return; }
    setSubmitting(true); setError("");

    let coverImage: string | null = null;
    if (coverFile) {
      try {
        const fd = new FormData();
        fd.append("file", coverFile);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) { const d = await res.json(); coverImage = d.url; }
      } catch { /* ignore cover upload failure */ }
    }

    try {
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       title.trim(),
          artist:      artist.trim(),
          difficulty:  Number(difficulty),
          bpmMin:      parsed?.bpmMin ?? 0,
          bpmMax:      parsed?.bpmMax ?? 0,
          duration:    parsed?.duration ?? 0,
          tileCount:   parsed?.tileCount ?? 0,
          coverImage,
          downloadUrl: downloadUrl.trim() || null,
          videoUrl:    videoUrl.trim()    || null,
          description: description.trim() || null,
          tags,
          bpmData:     parsed?.bpmData ?? null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Upload failed.");
        return;
      }
      const map = await res.json();
      setDone(true);
      setTimeout(() => router.push(`/maps/${map.id}`), 1500);
    } catch { setError("Network error. Please try again."); }
    finally  { setSubmitting(false); }
  }

  if (me === undefined) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-fire" />
    </div>
  );

  if (!me) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <Music size={40} className="text-dim" />
      <h1 className="text-xl font-black text-white">Sign in to upload maps</h1>
      <p className="text-soft text-sm">Create a free account to share your ADOFAI levels.</p>
      <div className="flex gap-3">
        <a href="/login"    className="px-5 py-2 border border-line rounded-xl text-sm text-soft hover:border-line-hi transition-colors">Log in</a>
        <a href="/register" className="px-5 py-2 fire-btn text-sm">Sign Up</a>
      </div>
    </div>
  );

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <CheckCircle size={48} className="text-easy" />
      <h1 className="text-xl font-black text-white">Map submitted!</h1>
      <p className="text-soft text-sm">Redirecting to your map…</p>
    </div>
  );

  const dc = getDifficultyColor(difficulty);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Upload Map</h1>
        <p className="text-sm text-soft mt-1">Share your ADOFAI level with the community</p>
      </div>

      {/* File drop */}
      {!parsed ? (
        <div className="mb-6">
          <label htmlFor="adofai-file"
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={`block cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-colors ${drag ? "border-fire/50 bg-fire/5" : "border-line hover:border-line-hi"}`}>
            <Upload size={32} className={`mx-auto mb-2 ${drag ? "text-fire" : "text-dim"}`} />
            <p className="font-bold text-white mb-1">Drop your .adofai file here</p>
            <p className="text-sm text-soft">or <span className="text-fire">click to browse</span></p>
            <p className="text-xs text-dim mt-1">Title, artist, BPM, and tile count will be auto-filled</p>
          </label>
          <input id="adofai-file" type="file" accept=".adofai,.json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 mb-6 bg-easy/8 border border-easy/20 rounded-xl text-sm">
          <CheckCircle size={14} className="text-easy flex-shrink-0" />
          <span className="text-white">File parsed — {parsed.tileCount.toLocaleString()} tiles, {parsed.bpmMin === parsed.bpmMax ? `${parsed.bpmMin}` : `${parsed.bpmMin}–${parsed.bpmMax}`} BPM</span>
          <button onClick={() => { setParsed(null); setTitle(""); setArtist(""); }}
            className="ml-auto text-dim hover:text-soft text-xs">change</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title & Artist */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-soft mb-1 block">Song Title *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} maxLength={200}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-card border border-line focus:border-fire text-white" />
          </div>
          <div>
            <label className="text-xs text-soft mb-1 block">Artist *</label>
            <input type="text" required value={artist} onChange={e => setArtist(e.target.value)} maxLength={200}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-card border border-line focus:border-fire text-white" />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs text-soft mb-2 block">
            Difficulty — <span className="font-bold" style={{ color: dc }}>{difficulty === 0 ? "Unrated" : difficulty}</span>
            {difficulty > 0 && <DifficultyBadge difficulty={difficulty} size="sm" className="ml-2" />}
          </label>
          <input type="range" min="0" max="21" step="1" value={difficulty}
            onChange={e => setDifficulty(Number(e.target.value))}
            className="w-full accent-fire" />
          <div className="flex justify-between text-xs text-dim mt-1">
            <span>Unrated</span><span>Beginner</span><span>Medium</span><span>Hard</span><span>Ultra</span>
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className="text-xs text-soft mb-2 block">Cover Image (optional)</label>
          <div className="flex items-center gap-4">
            {coverPreview && (
              <img src={coverPreview} alt="" className="w-16 h-16 rounded-xl object-cover border border-line" />
            )}
            <label htmlFor="cover-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-line rounded-xl text-sm text-soft hover:border-line-hi transition-colors">
              <Upload size={13} />Choose image
            </label>
            <input id="cover-upload" type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCover(f); }} />
          </div>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-soft mb-1 block flex items-center gap-1"><FileText size={10} />Download URL (optional)</label>
            <input type="url" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-card border border-line focus:border-fire text-white" />
          </div>
          <div>
            <label className="text-xs text-soft mb-1 block flex items-center gap-1"><Music size={10} />YouTube Video URL (optional)</label>
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-card border border-line focus:border-fire text-white" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-soft mb-1 block">Description (optional)</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} maxLength={500}
            placeholder="Describe your level, difficulty, patterns…"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-card border border-line focus:border-fire text-white resize-none" />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-soft mb-2 block flex items-center gap-1"><Tag size={10} />Tags</label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_TAGS.map(t => (
              <button key={t} type="button" onClick={() => toggleTag(t)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  tags.includes(t)
                    ? "bg-fire/10 border-fire/30 text-fire"
                    : "bg-card border-line text-soft hover:border-line-hi"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-fire bg-fire/8 border border-fire/20 rounded-xl px-4 py-3">{error}</p>}

        <button type="submit" disabled={submitting || !parsed}
          className="w-full py-3 fire-btn text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
          <Upload size={15} />{submitting ? "Uploading…" : "Submit Map"}
        </button>
        <p className="text-xs text-dim text-center">
          Maps are reviewed before going public. Admins/moderators are approved instantly.
        </p>
      </form>
    </div>
  );
}
