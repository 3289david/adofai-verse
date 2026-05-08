"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { MOCK_MAPS } from "@/lib/mock-data";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import type { MapData } from "@/lib/types";

const ALL_TAGS = [
  "#wave", "#spam", "#precision", "#speed", "#pattern",
  "#stream", "#technical", "#trills", "#beginner-friendly", "#slow",
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "difficulty_asc", label: "Easiest First" },
  { value: "difficulty_desc", label: "Hardest First" },
  { value: "bpm", label: "Highest BPM" },
];

export default function MapsPage() {
  const [search, setSearch] = useState("");
  const [diffMin, setDiffMin] = useState(1);
  const [diffMax, setDiffMax] = useState(21);
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(500);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const filteredMaps = useMemo<MapData[]>(() => {
    let maps = [...MOCK_MAPS];

    if (search.trim()) {
      const q = search.toLowerCase();
      maps = maps.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.artist.toLowerCase().includes(q) ||
          m.creator.username.toLowerCase().includes(q)
      );
    }

    maps = maps.filter(
      (m) => m.difficulty >= diffMin && m.difficulty <= diffMax
    );

    maps = maps.filter(
      (m) => m.bpmMax >= bpmMin && m.bpmMin <= bpmMax
    );

    if (selectedTags.length > 0) {
      maps = maps.filter((m) =>
        selectedTags.every((t) => m.tags.includes(t))
      );
    }

    switch (sort) {
      case "popular":
        maps.sort((a, b) => b.playCount - a.playCount);
        break;
      case "newest":
        maps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "difficulty_asc":
        maps.sort((a, b) => a.difficulty - b.difficulty);
        break;
      case "difficulty_desc":
        maps.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case "bpm":
        maps.sort((a, b) => b.bpmMax - a.bpmMax);
        break;
    }

    return maps;
  }, [search, diffMin, diffMax, bpmMin, bpmMax, selectedTags, sort]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const resetFilters = () => {
    setSearch("");
    setDiffMin(1);
    setDiffMax(21);
    setBpmMin(60);
    setBpmMax(500);
    setSelectedTags([]);
    setSort("popular");
  };

  const hasActiveFilters =
    diffMin > 1 || diffMax < 21 || bpmMin > 60 || bpmMax < 500 || selectedTags.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>
          Map Browser
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7777aa" }}>
          {filteredMaps.length.toLocaleString()} maps found
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#7777aa" }}
          />
          <input
            type="text"
            placeholder="Search by title, artist, or creator…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(16,16,30,0.9)",
              border: "1px solid rgba(26,26,53,0.8)",
              color: "#f0f0ff",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,34,68,0.4)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(26,26,53,0.8)";
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#7777aa" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showFilters ? "rgba(255,34,68,0.12)" : "rgba(16,16,30,0.9)",
              border: showFilters ? "1px solid rgba(255,34,68,0.3)" : "1px solid rgba(26,26,53,0.8)",
              color: showFilters ? "#ff8888" : "#7777aa",
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span
                className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "#ff2244", color: "white" }}
              >
                !
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none"
              style={{
                background: "rgba(16,16,30,0.9)",
                border: "1px solid rgba(26,26,53,0.8)",
                color: "#7777aa",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#10101e" }}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#7777aa" }}
            />
          </div>
        </div>
      </div>

      {showFilters && (
        <div
          className="mb-6 p-5 rounded-xl"
          style={{
            background: "rgba(16,16,30,0.9)",
            border: "1px solid rgba(26,26,53,0.8)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#7777aa" }}>
                Difficulty Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={diffMax}
                  value={diffMin}
                  onChange={(e) => setDiffMin(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{
                    background: "rgba(7,7,15,0.8)",
                    border: "1px solid rgba(26,26,53,0.8)",
                    color: getDifficultyColor(diffMin),
                  }}
                />
                <span style={{ color: "#44445a" }}>—</span>
                <input
                  type="number"
                  min={diffMin}
                  max={21}
                  value={diffMax}
                  onChange={(e) => setDiffMax(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{
                    background: "rgba(7,7,15,0.8)",
                    border: "1px solid rgba(26,26,53,0.8)",
                    color: getDifficultyColor(diffMax),
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "#44445a" }}>
                {getDifficultyLabel(diffMin)} — {getDifficultyLabel(diffMax)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#7777aa" }}>
                BPM Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={60}
                  max={bpmMax}
                  value={bpmMin}
                  onChange={(e) => setBpmMin(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{
                    background: "rgba(7,7,15,0.8)",
                    border: "1px solid rgba(26,26,53,0.8)",
                    color: "#0099ff",
                  }}
                />
                <span style={{ color: "#44445a" }}>—</span>
                <input
                  type="number"
                  min={bpmMin}
                  max={600}
                  value={bpmMax}
                  onChange={(e) => setBpmMax(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{
                    background: "rgba(7,7,15,0.8)",
                    border: "1px solid rgba(26,26,53,0.8)",
                    color: "#0099ff",
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "#44445a" }}>
                {bpmMin} — {bpmMax} BPM
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-2" style={{ color: "#7777aa" }}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all font-medium"
                      style={{
                        background: active ? "rgba(255,34,68,0.15)" : "rgba(7,7,15,0.8)",
                        border: active
                          ? "1px solid rgba(255,34,68,0.4)"
                          : "1px solid rgba(26,26,53,0.8)",
                        color: active ? "#ff8888" : "#7777aa",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 text-xs flex items-center gap-1 transition-all hover:opacity-80"
              style={{ color: "#7777aa" }}
            >
              <X size={12} />
              Reset all filters
            </button>
          )}
        </div>
      )}

      {filteredMaps.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-xl"
          style={{
            background: "rgba(16,16,30,0.5)",
            border: "1px solid rgba(26,26,53,0.8)",
          }}
        >
          <Search size={40} style={{ color: "#44445a" }} className="mb-4" />
          <p className="text-base font-medium" style={{ color: "#7777aa" }}>
            No maps found
          </p>
          <p className="text-sm mt-1" style={{ color: "#44445a" }}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMaps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      )}
    </div>
  );
}
