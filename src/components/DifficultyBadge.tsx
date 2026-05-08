import { getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  size = "md",
  showLabel = false,
  className,
}: DifficultyBadgeProps) {
  const color = getDifficultyColor(difficulty);
  const label = getDifficultyLabel(difficulty);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-[28px]",
    md: "text-sm px-2 py-1 min-w-[36px]",
    lg: "text-base px-3 py-1.5 min-w-[44px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded font-bold tabular-nums",
        "border",
        sizeClasses[size],
        className
      )}
      style={{
        color,
        borderColor: `${color}44`,
        backgroundColor: `${color}18`,
      }}
    >
      <span>{difficulty % 1 === 0 ? difficulty : difficulty.toFixed(1)}</span>
      {showLabel && (
        <span className="font-normal opacity-80 text-xs">{label}</span>
      )}
    </span>
  );
}
