export type DifficultyTier =
  | "beginner"
  | "easy"
  | "medium"
  | "hard"
  | "extreme"
  | "ultra";

export interface MapData {
  id: string;
  title: string;
  artist: string;
  creator: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  difficulty: number;
  bpmMin: number;
  bpmMax: number;
  duration: number;
  tileCount: number;
  coverImage?: string | null;
  downloadUrl?: string | null;
  description?: string | null;
  tags: string[];
  status: "PENDING" | "APPROVED" | "FEATURED" | "REMOVED";
  likeCount: number;
  playCount: number;
  bpmData?: BpmPoint[] | null;
  createdAt: string;
}

export interface BpmPoint {
  time: number;
  bpm: number;
}

export interface RecordData {
  id: string;
  userId: string;
  mapId: string;
  accuracy: number;
  attempts: number;
  cleared: boolean;
  score: number;
  xp: number;
  createdAt: string;
  user?: {
    username: string;
    avatar?: string | null;
    country?: string | null;
  };
  map?: Pick<MapData, "id" | "title" | "artist" | "difficulty">;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  country?: string | null;
  role: "PLAYER" | "CREATOR" | "MODERATOR" | "ADMIN";
  createdAt: string;
  _count?: {
    createdMaps: number;
    records: number;
  };
}

export interface RankingEntry {
  rank: number;
  user: Pick<UserData, "id" | "username" | "avatar" | "country">;
  totalXp: number;
  mapsCleared: number;
  avgAccuracy: number;
  topAccuracy: number;
}

export interface MapFilters {
  search?: string;
  diffMin?: number;
  diffMax?: number;
  bpmMin?: number;
  bpmMax?: number;
  tags?: string[];
  status?: string;
  sort?: "newest" | "popular" | "difficulty_asc" | "difficulty_desc" | "bpm";
  page?: number;
  limit?: number;
}

export interface AIAnalysisResult {
  difficulty_explanation: string;
  play_style: string;
  tips: string[];
  recommended_for: string;
  hardest_section: string;
  practice_advice: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}
