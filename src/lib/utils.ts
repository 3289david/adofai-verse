import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DifficultyTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDifficultyTier(difficulty: number): DifficultyTier {
  if (difficulty <= 0) return "beginner";
  if (difficulty <= 4) return "beginner";
  if (difficulty <= 8) return "easy";
  if (difficulty <= 12) return "medium";
  if (difficulty <= 16) return "hard";
  if (difficulty <= 20) return "extreme";
  return "ultra";
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 0) return "#555577";   // unrated / unknown
  if (difficulty <= 4) return "#44dd88";
  if (difficulty <= 8) return "#88ddff";
  if (difficulty <= 12) return "#ffdd00";
  if (difficulty <= 16) return "#ff8800";
  if (difficulty <= 20) return "#ff2244";
  return "#cc44ff";
}

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 0) return "Unrated";
  if (difficulty <= 4) return "Beginner";
  if (difficulty <= 8) return "Easy";
  if (difficulty <= 12) return "Medium";
  if (difficulty <= 16) return "Hard";
  if (difficulty <= 20) return "Extreme";
  return "Ultra";
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatBpm(min: number, max: number): string {
  if (min === max) return `${min} BPM`;
  return `${min}–${max} BPM`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function formatAccuracy(acc: number): string {
  return `${acc.toFixed(2)}%`;
}

export function getXpForDifficulty(difficulty: number, accuracy: number): number {
  const base = difficulty * 50;
  const bonus = accuracy >= 100 ? 1.5 : accuracy >= 99 ? 1.3 : accuracy >= 95 ? 1.1 : 1;
  return Math.round(base * bonus);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const DIFFICULTY_TAGS = [
  "#wave", "#spam", "#precision", "#speed", "#pattern",
  "#memorization", "#stream", "#trills", "#swing", "#polyrhythm",
  "#slow", "#twisty", "#technical", "#beginner-friendly",
];
