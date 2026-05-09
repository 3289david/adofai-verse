"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { getDifficultyColor } from "@/lib/utils";
import type { MapData } from "@/lib/types";

const TAGS  = ["#wave","#spam","#precision","#speed","#pattern","#stream","#technical","#beginner-friendly"];
const SORTS = [
  { value:"popular",         label:"Most Popular"  },
  { value:"newest",          label:"Newest"        },
  { value:"random",          label:"🎲 Random"      },
  { value:"difficulty_asc",  label:"Easiest First" },
  { value:"difficulty_desc", label:"Hardest First" },
  { value:"bpm",             label:"Highest BPM"   },
];

export default function MapsPage() {
  const [maps,    setMaps]    = useState<MapData[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [more,    setMore]    = useState(false);

  const [q,       setQ]       = useState("");
  const [diffMin, setDiffMin] = useState(0);
  const [diffMax, setDiffMax] = useState(21);
  const [tags,    setTags]    = useState<string[]>([]);
  const [sort,    setSort]    = useState("popular");
  const [showF,   setShowF]   = useState(false);

  const LIMIT = 24;

  const fetchMaps = useCallback(async (pg: number, append = false) => {
    pg === 1 ? setLoading(true) : setMore(true);
    try {
      const p = new URLSearchParams({ sort, page: String(pg), limit: String(LIMIT) });
      if (q.trim())     p.set("search", q.trim());
      if (diffMin > 0)  p.set("diffMin", String(diffMin));
      if (diffMax < 21) p.set("diffMax", String(diffMax));
      tags.forEach(t => p.append("tags", t));

      const res  = await fetch(`/api/maps?${p}`);
      const data = await res.json();
      setMaps(prev => append ? [...prev, ...(data.maps ?? [])] : (data.maps ?? []));
      setTotal(data.total ?? 0);
      setPage(pg);
    } catch { /* keep current state */ }
    finally { setLoading(false); setMore(false); }
  }, [q, diffMin, diffMax, tags, sort]);

  useEffect(() => {
    const t = setTimeout(() => fetchMaps(1), q ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchMaps, q]);

  const toggle  = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const reset   = () => { setDiffMin(0); setDiffMax(21); setTags([]); };
  const dirty   = diffMin > 0 || diffMax < 21 || tags.length > 0;
  const hasMore = maps.length < total;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Map Browser</h1>
        {!loading && <p className="text-sm text-soft mt-1">{total.toLocaleString()} maps</p>}
      </div>

      {/* Search row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search maps, artists, creators…"
            className="w-full bg-card border border-line rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-soft outline-none focus:border-line-hi"
          />
          {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-soft"><X size={13} /></button>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowF(!showF)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showF ? "bg-fire/10 border-fire/30 text-fire" : "bg-card border-line text-soft hover:border-line-hi"}`}
          >
            Filters {dirty && <span className="ml-1 w-4 h-4 rounded-full bg-fire text-white text-[10px] inline-flex items-center justify-center font-black">!</span>}
          </button>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="appearance-none bg-card border border-line rounded-xl pl-3 pr-8 py-2.5 text-sm text-soft outline-none cursor-pointer hover:border-line-hi">
              {SORTS.map(o => <option key={o.value} value={o.value} style={{background:"#111127"}}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showF && (
        <div className="mb-4 p-4 bg-card border border-line rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-soft font-bold mb-2">DIFFICULTY</p>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={diffMax} value={diffMin} onChange={e => setDiffMin(+e.target.value)}
                  className="w-16 bg-page border border-line rounded-lg px-2 py-1.5 text-sm text-center outline-none"
                  style={{color: getDifficultyColor(diffMin)}} />
                <span className="text-dim">—</span>
                <input type="number" min={diffMin} max={21} value={diffMax} onChange={e => setDiffMax(+e.target.value)}
                  className="w-16 bg-page border border-line rounded-lg px-2 py-1.5 text-sm text-center outline-none"
                  style={{color: getDifficultyColor(diffMax)}} />
              </div>
            </div>
            <div>
              <p className="text-xs text-soft font-bold mb-2">TAGS</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(t => (
                  <button key={t} onClick={() => toggle(t)}
                    className={`text-xs px-2 py-0.5 rounded-lg border transition-colors ${tags.includes(t) ? "bg-fire/10 border-fire/30 text-fire" : "bg-page border-line text-soft hover:border-line-hi"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {dirty && <button onClick={reset} className="mt-3 text-xs text-dim flex items-center gap-1 hover:text-soft"><X size={11} />Reset filters</button>}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="text-soft animate-spin" />
        </div>
      ) : maps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-line rounded-xl text-center">
          <div className="text-4xl mb-3">🎵</div>
          <p className="font-bold text-white mb-1">{q || dirty ? "No maps match your search" : "No maps yet"}</p>
          <p className="text-sm text-soft">{q || dirty ? "Try different filters" : "Be the first to add a map!"}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {maps.map(m => <MapCard key={m.id} map={m} />)}
          </div>
          {sort === "random" ? (
            <div className="mt-8 text-center">
              <button onClick={() => fetchMaps(1)} disabled={loading}
                className="px-8 py-2.5 bg-card border border-line rounded-xl text-sm text-soft hover:border-line-hi disabled:opacity-50 transition-colors inline-flex items-center gap-2">
                {loading && <Loader2 size={13} className="animate-spin" />}
                🎲 Shuffle again
              </button>
            </div>
          ) : hasMore && (
            <div className="mt-8 text-center">
              <button onClick={() => fetchMaps(page + 1, true)} disabled={more}
                className="px-8 py-2.5 bg-card border border-line rounded-xl text-sm text-soft hover:border-line-hi disabled:opacity-50 transition-colors inline-flex items-center gap-2">
                {more && <Loader2 size={13} className="animate-spin" />}
                {more ? "Loading…" : `Load more (${total - maps.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
