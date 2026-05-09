import Link from "next/link";
import { Heart, Play } from "lucide-react";
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

  return (
    <Link href={`/maps/${map.id}`} className="group block">
      <div className="bg-card border border-line rounded-xl overflow-hidden hover:border-line-hi transition-colors">
        {/* Thumbnail */}
        <div className="h-28 relative overflow-hidden bg-gradient-to-br from-page to-card">
          {thumb ? (
            <img src={thumb} alt={map.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-black text-line-hi group-hover:text-line transition-colors select-none">♪</span>
            </div>
          )}
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          {/* Badges */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            <DifficultyBadge difficulty={map.difficulty} size="sm" />
          </div>
          {map.status === "FEATURED" && (
            <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-fire-2/90 text-white">★</span>
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
