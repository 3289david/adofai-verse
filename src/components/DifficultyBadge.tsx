import { getDifficultyColor } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function DifficultyBadge({ difficulty, size = "md", showLabel = false }: DifficultyBadgeProps) {
  const color = getDifficultyColor(difficulty);
  const pad = size === "sm" ? "px-1.5 py-0.5 text-xs" : size === "lg" ? "px-3 py-1.5 text-base" : "px-2 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-bold tabular-nums ${pad}`}
      style={{ color, borderColor: `${color}44`, backgroundColor: `${color}18`, border: `1px solid ${color}44` }}
    >
      {difficulty <= 0 ? "?" : difficulty % 1 === 0 ? difficulty : difficulty.toFixed(1)}
    </span>
  );
}
