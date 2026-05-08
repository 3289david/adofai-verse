"use client";

import { useState } from "react";
import { Download, RefreshCw, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

interface ImportResult {
  ok?: boolean;
  total?: number;
  imported?: number;
  updated?: number;
  skipped?: number;
  pages?: number;
  error?: string;
}

interface Source {
  id:        "adofaigg" | "steam";
  label:     string;
  desc:      string;
  color:     string;
  badge:     string;
  note:      string;
  needsKey:  boolean;
}

const SOURCES: Source[] = [
  {
    id:       "adofaigg",
    label:    "adofai.gg",
    desc:     "Imports all ~4,700 ranked maps from the official adofai.gg Google Sheets database. Includes difficulty, BPM, tile count, tags, and download links.",
    color:    "#ff3355",
    badge:    "~4,700 maps",
    note:     "No API key required — reads the public Google Sheets directly.",
    needsKey: false,
  },
  {
    id:       "steam",
    label:    "Steam Workshop",
    desc:     "Imports user-made levels from the ADOFAI Steam Workshop (App ID 977950). Fetches up to 5,000 newest workshop items with cover images and subscriber counts.",
    color:    "#1b9aff",
    badge:    "Up to 5,000 maps",
    note:     "Requires a free Steam Web API key from steamcommunity.com/dev/apikey",
    needsKey: true,
  },
];

export function ImportUI() {
  const [steamKey,  setSteamKey]  = useState("");
  const [loading,   setLoading]   = useState<string | null>(null);
  const [results,   setResults]   = useState<Record<string, ImportResult>>({});

  async function runImport(src: Source) {
    if (loading) return;
    setLoading(src.id);
    setResults(r => ({ ...r, [src.id]: {} }));

    try {
      const body = src.needsKey ? { steamKey } : undefined;
      const res  = await fetch(`/api/admin/import/${src.id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    body ? JSON.stringify(body) : undefined,
      });
      setResults(r => ({ ...r, [src.id]: res.ok ? {} : {} }));
      setResults(r => ({ ...r, [src.id]: { ...(r[src.id] ?? {}) } }));
      const data: ImportResult = await res.json();
      setResults(r => ({ ...r, [src.id]: data }));
    } catch (e) {
      setResults(r => ({ ...r, [src.id]: { error: String(e) } }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Data Import</h1>
        <p className="text-sm text-soft">Admin only — pull maps from external sources into the database.</p>
      </div>

      <div className="space-y-4">
        {SOURCES.map(src => {
          const result  = results[src.id];
          const busy    = loading === src.id;
          const isDone  = result?.ok === true;
          const isError = result?.error;

          return (
            <div key={src.id} className="bg-card border border-line rounded-xl p-5" style={{ borderColor: isDone ? `${src.color}40` : undefined }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-white">{src.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${src.color}15`, color: src.color, border: `1px solid ${src.color}30` }}>{src.badge}</span>
                  </div>
                  <p className="text-sm text-soft leading-relaxed">{src.desc}</p>
                  <p className="text-xs text-dim mt-1">{src.note}</p>
                </div>
              </div>

              {src.needsKey && (
                <input
                  type="password"
                  value={steamKey}
                  onChange={e => setSteamKey(e.target.value)}
                  placeholder="Steam Web API Key"
                  className="w-full bg-page border border-line rounded-lg px-3 py-2 text-sm text-white placeholder:text-dim outline-none focus:border-line-hi mb-3"
                />
              )}

              {isDone && result && (
                <div className="mb-3 p-3 rounded-lg bg-page border border-line text-sm">
                  <div className="flex items-center gap-2 mb-2 text-easy font-bold">
                    <CheckCircle2 size={14} />
                    Import complete
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Imported",  val: result.imported ?? 0,   c: "#44dd88" },
                      { label: "Updated",   val: result.updated  ?? 0,   c: "#0077ff" },
                      { label: "Skipped",   val: result.skipped  ?? 0,   c: "#6666aa" },
                    ].map(({ label, val, c }) => (
                      <div key={label} className="bg-card rounded-lg p-2">
                        <div className="text-lg font-black tabular-nums" style={{ color: c }}>{val.toLocaleString()}</div>
                        <div className="text-xs text-dim">{label}</div>
                      </div>
                    ))}
                  </div>
                  {result.pages !== undefined && <p className="text-xs text-dim mt-2">Fetched {result.pages} page{result.pages !== 1 ? "s" : ""} from Steam</p>}
                </div>
              )}

              {isError && (
                <div className="mb-3 p-3 rounded-lg bg-fire/8 border border-fire/20 text-sm text-fire flex items-start gap-2">
                  <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {result.error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => runImport(src)}
                  disabled={busy || (src.needsKey && !steamKey.trim())}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${src.color}, ${src.color}bb)` }}
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : isDone ? <RefreshCw size={13} /> : <Download size={13} />}
                  {busy ? "Importing…" : isDone ? "Re-import" : "Import Now"}
                </button>
                {src.needsKey && (
                  <a
                    href="https://steamcommunity.com/dev/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-soft border border-line hover:border-line-hi transition-colors"
                  >
                    Get API Key <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-card border border-line rounded-xl text-xs text-soft space-y-1">
        <p className="font-bold text-white mb-2">Notes</p>
        <p>• Maps are imported with status <span className="text-easy">APPROVED</span> and credited to a system user.</p>
        <p>• Re-importing updates existing maps by external ID — no duplicates are created.</p>
        <p>• adofai.gg maps with negative or zero difficulty (unrated) are skipped.</p>
        <p>• Add <code className="bg-page px-1 rounded">STEAM_API_KEY=your_key</code> to <code className="bg-page px-1 rounded">.env.local</code> to skip entering it here.</p>
      </div>
    </div>
  );
}
