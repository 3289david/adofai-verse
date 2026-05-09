"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Play, Bookmark, BookmarkCheck } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { formatBpm, formatNumber } from "@/lib/utils";
import type { MapData } from "@/lib/types";

function getYtId(url?: string | null) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function MapCard({ map }: { map: MapData }) {
  const ytId = getYtId(map.videoUrl);
  const thumb = map.coverImage || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
  const [bookmarked, setBookmarked] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { mapId: string }[]) => {
        if (Array.isArray(list) && list.some((b) => b.mapId === map.id)) {
          setBookmarked(true);
        }
      })
      .catch(() => {});
  }, [map.id]);

  function handleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapId: map.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.bookmarked === "boolean") setBookmarked(data.bookmarked);
      })
      .catch(() => {})
      .finally(() => setToggling(false));
  }

  const BmIcon = bookmarked ? BookmarkCheck : Bookmark;

  return (
    <Link href={`/maps/${map.id}`} className="group block">
      <div className="map-card bg-card border border-line rounded-xl overflow-hidden hover:border-line-hi transition-colors">
        <div className="h-28 relative overflow-hidden bg-gradient-to-br from-page to-card">
          {thumb ? (
            <img src={thumb} alt={map.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-page to-card">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-30 group-hover:opacity-50 transition-opacity">
                <rect x="5" y="5" width="30" height="30" rx="4" fill="currentColor" transform="rotate(45 20 20)" className="text-soft"/>
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex gap-1">
            <DifficultyBadge difficulty={map.difficulty} size="sm" />
          </div>
          <button
            onClick={handleBookmark}
            className="absolute top-2 right-2 p-1 rounded-md transition-colors"
            style={{
              background: bookmarked ? "rgba(255,34,68,0.2)" : "rgba(16,16,30,0.6)",
              color: bookmarked ? "#ff2244" : "#7777aa",
            }}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark map"}
          >
            <BmIcon size={14} />
          </button>
          {map.status === "FEATURED" && (
            <span
              className="absolute top-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-fire-2/90 text-white"
              style={{ right: "2.25rem" }}
            >
              ★
            </span>
          )}
        </div>

        <div className="p-3">
          <p className="text-sm font-bold text-white truncate leading-tight mb-0.5">{map.title}</p>
          <p className="text-xs text-soft truncate mb-2">{map.artist}</p>

          {(map.bpmMin > 0 || map.bpmMax > 0) && (
            <p className="text-xs text-dim mb-1">{formatBpm(map.bpmMin, map.bpmMax)}</p>
          )}

          {map.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {map.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-line text-soft">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-line text-xs text-dim">
            <span className="flex items-center gap-1"><Heart size={9} />{formatNumber(map.likeCount)}</span>
            <span className="flex items-center gap-1"><Play size={9} />{formatNumber(map.playCount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
