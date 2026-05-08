"use client";

import Link from "next/link";
import { Heart, Play, Clock, Music } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { formatDuration, formatBpm, formatNumber } from "@/lib/utils";
import type { MapData } from "@/lib/types";

interface MapCardProps {
  map: MapData;
  compact?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  "#wave": "#0099ff",
  "#spam": "#ff2244",
  "#precision": "#cc44ff",
  "#speed": "#ff8800",
  "#pattern": "#44dd88",
  "#stream": "#ffdd00",
  "#technical": "#ff5500",
  "#trills": "#00ddff",
  "#memorization": "#ff44cc",
  "#beginner-friendly": "#44dd88",
  "#slow": "#88bbff",
  "#swing": "#ddaa44",
  "#polyrhythm": "#cc88ff",
  "#stamina": "#ff6644",
};

export function MapCard({ map, compact = false }: MapCardProps) {
  const isFeatured = map.status === "FEATURED";

  return (
    <Link href={`/maps/${map.id}`} className="group block">
      <article
        className="relative rounded-xl border overflow-hidden transition-all duration-300"
        style={{
          background: "rgba(16,16,30,0.9)",
          borderColor: isFeatured ? "rgba(255,136,0,0.3)" : "rgba(26,26,53,0.8)",
          boxShadow: isFeatured ? "0 0 20px rgba(255,136,0,0.08)" : "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            isFeatured ? "rgba(255,136,0,0.6)" : "rgba(46,46,90,1)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = isFeatured
            ? "0 8px 32px rgba(255,136,0,0.15)"
            : "0 8px 32px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = isFeatured
            ? "rgba(255,136,0,0.3)"
            : "rgba(26,26,53,0.8)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = isFeatured
            ? "0 0 20px rgba(255,136,0,0.08)"
            : "none";
        }}
      >
        {isFeatured && (
          <div
            className="absolute top-2.5 right-2.5 z-10 text-xs font-bold px-2 py-0.5 rounded"
            style={{ background: "rgba(255,136,0,0.2)", color: "#ff8800", border: "1px solid rgba(255,136,0,0.4)" }}
          >
            FEATURED
          </div>
        )}

        <div
          className="relative h-28 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(7,7,15,0.9), rgba(13,13,31,0.9))`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${
                map.difficulty >= 18 ? "#ff2244" : map.difficulty >= 12 ? "#ff8800" : map.difficulty >= 6 ? "#ffdd00" : "#44dd88"
              } 0%, transparent 70%)`,
            }}
          />
          <div className="relative z-10 text-center px-3">
            <Music
              size={28}
              className="mx-auto mb-1 opacity-30"
              style={{ color: "#f0f0ff" }}
            />
            <p
              className="text-xs opacity-50 font-medium truncate max-w-[160px]"
              style={{ color: "#7777aa" }}
            >
              {map.artist}
            </p>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-8"
            style={{
              background: "linear-gradient(to top, rgba(16,16,30,1), transparent)",
            }}
          />
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3
                className="font-bold text-sm leading-tight truncate"
                style={{ color: "#f0f0ff" }}
              >
                {map.title}
              </h3>
              <p className="text-xs truncate mt-0.5" style={{ color: "#7777aa" }}>
                by {map.creator.username}
              </p>
            </div>
            <DifficultyBadge difficulty={map.difficulty} size="sm" />
          </div>

          {!compact && (
            <div
              className="flex items-center gap-3 text-xs mb-2"
              style={{ color: "#7777aa" }}
            >
              <span className="flex items-center gap-1">
                <span style={{ color: "#0099ff" }}>♪</span>
                {formatBpm(map.bpmMin, map.bpmMax)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatDuration(map.duration)}
              </span>
            </div>
          )}

          {map.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {map.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    color: TAG_COLORS[tag] ?? "#7777aa",
                    background: `${TAG_COLORS[tag] ?? "#7777aa"}18`,
                    border: `1px solid ${TAG_COLORS[tag] ?? "#7777aa"}33`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="flex items-center gap-3 text-xs pt-2"
            style={{
              color: "#44445a",
              borderTop: "1px solid rgba(26,26,53,0.8)",
            }}
          >
            <span className="flex items-center gap-1">
              <Heart size={10} />
              {formatNumber(map.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <Play size={10} />
              {formatNumber(map.playCount)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
