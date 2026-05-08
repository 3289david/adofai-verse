"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { MOCK_MAPS } from "@/lib/mock-data";
import { getDifficultyColor } from "@/lib/utils";
import type { MapData } from "@/lib/types";

const TAGS = ["#wave","#spam","#precision","#speed","#pattern","#stream","#technical","#beginner-friendly"];
const SORTS = [
  { value: "popular",        label: "Most Popular"    },
  { value: "newest",         label: "Newest"          },
  { value: "difficulty_asc", label: "Easiest First"   },
  { value: "difficulty_desc",label: "Hardest First"   },
  { value: "bpm",            label: "Highest BPM"     },
];

export default function MapsPage() {
  const [q,        setQ]        = useState("");
  const [diffMin,  setDiffMin]  = useState(1);
  const [diffMax,  setDiffMax]  = useState(21);
  const [tags,     setTags]     = useState<string[]>([]);
  const [sort,     setSort]     = useState("popular");
  const [showF,    setShowF]    = useState(false);

  const maps = useMemo<MapData[]>(() => {
    let list = [...MOCK_MAPS];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(s) || m.artist.toLowerCase().includes(s) || m.creator.username.toLowerCase().includes(s));
    }
    list = list.filter(m => m.difficulty >= diffMin && m.difficulty <= diffMax);
    if (tags.length) list = list.filter(m => tags.every(t => m.tags.includes(t)));
    switch (sort) {
      case "popular":         list.sort((a,b) => b.playCount  - a.playCount);   break;
      case "newest":          list.sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
      case "difficulty_asc":  list.sort((a,b) => a.difficulty - b.difficulty);  break;
      case "difficulty_desc": list.sort((a,b) => b.difficulty - a.difficulty);  break;
      case "bpm":             list.sort((a,b) => b.bpmMax     - a.bpmMax);      break;
    }
    return list;
  }, [q, diffMin, diffMax, tags, sort]);

  const toggle = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const reset  = () => { setQ(""); setDiffMin(1); setDiffMax(21); setTags([]); setSort("popular"); };
  const dirty  = diffMin > 1 || diffMax < 21 || tags.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Map Browser</h1>
        <p className="text-sm text-soft mt-1">{maps.length} maps found</p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search title, artist, creator…"
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
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-card border border-line rounded-xl pl-3 pr-8 py-2.5 text-sm text-soft cursor-pointer outline-none hover:border-line-hi"
            >
              {SORTS.map(o => <option key={o.value} value={o.value} style={{background:"#111127"}}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showF && (
        <div className="mb-4 p-4 bg-card border border-line rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-soft font-medium mb-2">Difficulty</p>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={diffMax} value={diffMin} onChange={e => setDiffMin(+e.target.value)}
                  className="w-16 bg-page border border-line rounded-lg px-2 py-1.5 text-sm text-center outline-none"
                  style={{ color: getDifficultyColor(diffMin) }} />
                <span className="text-dim">—</span>
                <input type="number" min={diffMin} max={21} value={diffMax} onChange={e => setDiffMax(+e.target.value)}
                  className="w-16 bg-page border border-line rounded-lg px-2 py-1.5 text-sm text-center outline-none"
                  style={{ color: getDifficultyColor(diffMax) }} />
              </div>
            </div>
            <div>
              <p className="text-xs text-soft font-medium mb-2">Tags</p>
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
          {dirty && <button onClick={reset} className="mt-3 text-xs text-dim flex items-center gap-1 hover:text-soft"><X size={11} />Reset</button>}
        </div>
      )}

      {/* Grid */}
      {maps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-line rounded-xl">
          <Search size={36} className="text-dim mb-3" />
          <p className="text-soft">No maps found — try adjusting filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {maps.map(m => <MapCard key={m.id} map={m} />)}
        </div>
      )}
    </div>
  );
}
