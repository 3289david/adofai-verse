import Link from "next/link";
import { Heart, Play, Clock } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { formatDuration, formatBpm, formatNumber } from "@/lib/utils";
import type { MapData } from "@/lib/types";

interface MapCardProps {
  map: MapData;
}

export function MapCard({ map }: MapCardProps) {
  return (
    <Link href={`/maps/${map.id}`} className="group block">
      <div className="bg-card border border-line rounded-xl overflow-hidden hover:border-line-hi transition-colors">
        <div className="h-24 bg-gradient-to-br from-page to-card flex items-center justify-center relative">
          {map.status === "FEATURED" && (
            <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-fire-2/20 text-fire-2 border border-fire-2/30">
              ★
            </span>
          )}
          <span className="text-3xl font-black text-line-hi group-hover:text-line transition-colors">
            ♪
          </span>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-white truncate leading-tight">{map.title}</p>
            <DifficultyBadge difficulty={map.difficulty} size="sm" />
          </div>

          <p className="text-xs text-soft truncate mb-2">{map.artist}</p>

          <div className="flex items-center gap-2 text-xs text-dim">
            <span>{formatBpm(map.bpmMin, map.bpmMax)}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Clock size={9} />
              {formatDuration(map.duration)}
            </span>
          </div>

          {map.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {map.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-line text-soft">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-line text-xs text-dim">
            <span className="flex items-center gap-1"><Heart size={9} />{formatNumber(map.likeCount)}</span>
            <span className="flex items-center gap-1"><Play size={9} />{formatNumber(map.playCount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
