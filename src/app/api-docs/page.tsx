"use client";

import { useState } from "react";
import { Code2, ArrowRight, Copy, Check, ChevronDown, ChevronRight, Globe, Lock, Shield } from "lucide-react";

interface Param {
  name: string;
  type: string;
  desc: string;
  required?: boolean;
  default?: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth?: "none" | "user" | "admin";
  params?: Param[];
  body?: string;
  response?: string;
}

const SECTIONS: { title: string; description: string; endpoints: Endpoint[] }[] = [
  {
    title: "Maps",
    description: "Browse, search, and interact with the map database",
    endpoints: [
      {
        method: "GET",
        path: "/api/maps",
        description: "List maps with search, filtering, sorting, and pagination",
        auth: "none",
        params: [
          { name: "search", type: "string", desc: "Search by title, artist, or creator name", required: false },
          { name: "diffMin", type: "number", desc: "Minimum difficulty (0–21+)", default: "0" },
          { name: "diffMax", type: "number", desc: "Maximum difficulty (0–21+)", default: "99" },
          { name: "tags", type: "string[]", desc: "Filter by tags — repeatable (e.g. ?tags=%23wave&tags=%23spam)", required: false },
          { name: "sort", type: "string", desc: "Sort order", default: "random", required: false },
          { name: "page", type: "number", desc: "Page number", default: "1" },
          { name: "limit", type: "number", desc: "Results per page (max 100)", default: "24" },
        ],
        response: `{
  "maps": [
    {
      "id": "clx...",
      "title": "Goodbye",
      "artist": "Toe",
      "difficulty": 15.2,
      "bpmMin": 180,
      "bpmMax": 360,
      "duration": 204,
      "tileCount": 650,
      "tags": ["#wave", "#precision"],
      "likeCount": 42,
      "playCount": 128,
      "status": "APPROVED",
      "creator": { "username": "mapmaker" }
    }
  ],
  "total": 4734,
  "page": 1,
  "limit": 24
}`,
      },
      {
        method: "GET",
        path: "/api/maps/:id",
        description: "Get a single map with full data including top records, creator info, and BPM chart data",
        auth: "none",
        response: `{
  "id": "clx...",
  "title": "Goodbye",
  "artist": "Toe",
  "difficulty": 15.2,
  "bpmMin": 180,
  "bpmMax": 360,
  "duration": 204,
  "tileCount": 650,
  "tags": ["#wave", "#precision"],
  "description": "A challenging wave map...",
  "videoUrl": "https://youtube.com/watch?v=...",
  "downloadUrl": "https://...",
  "bpmData": [{"time": 0, "bpm": 180}, ...],
  "creator": { "id": "...", "username": "mapmaker" },
  "records": [
    {
      "id": "...",
      "accuracy": 98.5,
      "score": 985000,
      "cleared": true,
      "user": { "username": "player1" }
    }
  ],
  "likeCount": 42,
  "playCount": 128
}`,
      },
      {
        method: "PATCH",
        path: "/api/maps/:id",
        description: "Edit map metadata (creator or admin only)",
        auth: "user",
        body: `{
  "title": "Updated Title",
  "artist": "Updated Artist",
  "difficulty": 16,
  "bpmMin": 200,
  "bpmMax": 400,
  "tags": ["#wave", "#speed"],
  "description": "New description"
}`,
        response: `{ "id": "clx...", "title": "Updated Title", ... }`,
      },
      {
        method: "GET",
        path: "/api/maps/:id/similar",
        description: "Find up to 6 similar maps based on difficulty (±3) and overlapping tags",
        auth: "none",
        response: `[
  {
    "id": "clx...",
    "title": "Similar Map",
    "artist": "Artist",
    "difficulty": 14.5,
    "tags": ["#wave"],
    "coverImage": "https://..."
  }
]`,
      },
      {
        method: "GET",
        path: "/api/maps/:id/comments",
        description: "Get the latest 50 comments on a map, newest first",
        auth: "none",
        response: `[
  {
    "id": "clx...",
    "content": "Great map!",
    "createdAt": "2025-05-09T12:00:00Z",
    "user": {
      "id": "...",
      "username": "player1",
      "avatar": "/uploads/avatar.png"
    }
  }
]`,
      },
      {
        method: "POST",
        path: "/api/maps/:id/comments",
        description: "Post a comment on a map (1–500 characters)",
        auth: "user",
        body: `{ "content": "This map is amazing!" }`,
        response: `{
  "id": "clx...",
  "content": "This map is amazing!",
  "createdAt": "2025-05-09T12:00:00Z",
  "user": { "username": "player1" }
}`,
      },
      {
        method: "GET",
        path: "/api/maps/:id/like",
        description: "Check if the current user has liked a map",
        auth: "user",
        response: `{ "liked": true, "likeCount": 43 }`,
      },
      {
        method: "POST",
        path: "/api/maps/:id/like",
        description: "Toggle like on a map (like/unlike)",
        auth: "user",
        response: `{ "liked": true, "likeCount": 44 }`,
      },
    ],
  },
  {
    title: "Rankings & Records",
    description: "Global leaderboards and score submissions",
    endpoints: [
      {
        method: "GET",
        path: "/api/rankings",
        description: "Global player rankings sorted by XP",
        auth: "none",
        params: [
          { name: "limit", type: "number", desc: "Number of results (max 100)", default: "50" },
        ],
        response: `[
  {
    "id": "...",
    "username": "topplayer",
    "avatar": "/uploads/avatar.png",
    "country": "KR",
    "xp": 125000,
    "records": [{ "cleared": true, "accuracy": 99.1 }]
  }
]`,
      },
      {
        method: "POST",
        path: "/api/records",
        description: "Submit a new record for a map (requires gameplay video URL)",
        auth: "user",
        body: `{
  "mapId": "clx...",
  "accuracy": 98.5,
  "attempts": 42,
  "cleared": true,
  "videoUrl": "https://youtube.com/watch?v=..."
}`,
        response: `{
  "id": "...",
  "accuracy": 98.5,
  "score": 985000,
  "xp": 1500,
  "cleared": true
}`,
      },
    ],
  },
  {
    title: "Bookmarks",
    description: "Save maps for later",
    endpoints: [
      {
        method: "GET",
        path: "/api/bookmarks",
        description: "List the current user's bookmarked maps with full map data",
        auth: "user",
        response: `[
  {
    "id": "clx...",
    "mapId": "clx...",
    "createdAt": "2025-05-09T12:00:00Z",
    "map": { "id": "...", "title": "Goodbye", "difficulty": 15.2, ... }
  }
]`,
      },
      {
        method: "POST",
        path: "/api/bookmarks",
        description: "Toggle bookmark on a map (add/remove)",
        auth: "user",
        body: `{ "mapId": "clx..." }`,
        response: `{ "bookmarked": true }`,
      },
    ],
  },
  {
    title: "AI",
    description: "AI-powered analysis and coaching via Pollinations AI (free, no API key)",
    endpoints: [
      {
        method: "POST",
        path: "/api/ai/analyze",
        description: "Get an AI analysis of a map — difficulty breakdown, tips, playstyle, hardest section",
        auth: "none",
        body: `{
  "map": {
    "id": "...",
    "title": "Goodbye",
    "artist": "Toe",
    "difficulty": 15,
    "bpmMin": 180,
    "bpmMax": 360,
    "duration": 200,
    "tileCount": 650,
    "tags": ["#wave", "#precision"]
  }
}`,
        response: `{
  "summary": "A challenging wave map...",
  "difficulty_analysis": "...",
  "playstyle": "...",
  "tips": ["...", "..."],
  "hardest_section": "...",
  "recommended_for": "..."
}`,
      },
      {
        method: "POST",
        path: "/api/ai/coach",
        description: "Chat with the AI coach — ask about techniques, maps, improvement strategies",
        auth: "none",
        body: `{
  "message": "How do I improve at wave maps?",
  "context": "Working on Difficulty 15 wave map at 180 BPM"
}`,
        response: `"Wave maps require precise timing..."`,
      },
    ],
  },
  {
    title: "Auth",
    description: "User authentication via JWT httpOnly cookies",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        description: "Create a new account",
        auth: "none",
        body: `{
  "username": "player1",
  "email": "player@example.com",
  "password": "securepassword"
}`,
        response: `{ "user": { "id": "...", "username": "player1" } }`,
      },
      {
        method: "POST",
        path: "/api/auth/login",
        description: "Log in and receive an httpOnly JWT cookie",
        auth: "none",
        body: `{
  "email": "player@example.com",
  "password": "securepassword"
}`,
        response: `{ "user": { "id": "...", "username": "player1", "role": "PLAYER" } }`,
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "Clear the auth cookie",
        auth: "user",
        response: `{ "ok": true }`,
      },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "Get the currently authenticated user",
        auth: "user",
        response: `{ "id": "...", "username": "player1", "email": "...", "role": "PLAYER" }`,
      },
    ],
  },
  {
    title: "Platform",
    description: "Platform statistics and user profiles",
    endpoints: [
      {
        method: "GET",
        path: "/api/stats",
        description: "Get platform-wide statistics",
        auth: "none",
        response: `{ "maps": 4734, "players": 1200, "records": 8500 }`,
      },
      {
        method: "GET",
        path: "/api/profile/:username",
        description: "Get a user's public profile with all records",
        auth: "none",
        response: `{
  "id": "...",
  "username": "player1",
  "avatar": "/uploads/avatar.png",
  "country": "US",
  "bio": "...",
  "role": "PLAYER",
  "xp": 50000,
  "records": [...]
}`,
      },
    ],
  },
];

const SORT_VALUES = [
  { value: "random", desc: "Random order (default)" },
  { value: "popular", desc: "Most liked maps first" },
  { value: "trending", desc: "Trending by likes + plays + recency" },
  { value: "newest", desc: "Most recently created" },
  { value: "difficulty_asc", desc: "Easiest first" },
  { value: "difficulty_desc", desc: "Hardest first" },
  { value: "bpm", desc: "Highest BPM first" },
];

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: "rgba(68,221,136,0.12)", color: "#44dd88" },
  POST: { bg: "rgba(0,153,255,0.12)", color: "#0099ff" },
  PATCH: { bg: "rgba(255,170,0,0.12)", color: "#ffaa00" },
  DELETE: { bg: "rgba(255,34,68,0.12)", color: "#ff2244" },
};

const AUTH_BADGES: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  none: { icon: Globe, label: "Public", color: "#44dd88" },
  user: { icon: Lock, label: "Auth Required", color: "#ffaa00" },
  admin: { icon: Shield, label: "Admin Only", color: "#ff2244" },
};

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const mc = METHOD_COLORS[ep.method] ?? { bg: "rgba(119,119,170,0.12)", color: "#7777aa" };
  const auth = AUTH_BADGES[ep.auth ?? "none"];
  const AuthIcon = auth.icon;

  function copyEndpoint() {
    navigator.clipboard.writeText(`https://adofai.net${ep.path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(26,26,53,0.8)" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        style={{ background: "rgba(16,16,30,0.9)" }}
      >
        <span
          className="px-2.5 py-1 rounded-lg text-xs font-black font-mono flex-shrink-0"
          style={{ background: mc.bg, color: mc.color }}
        >
          {ep.method}
        </span>
        <code className="text-sm font-mono font-bold flex-1 truncate" style={{ color: "#f0f0ff" }}>
          {ep.path}
        </code>
        <span
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
          style={{ background: `${auth.color}15`, color: auth.color, border: `1px solid ${auth.color}30` }}
        >
          <AuthIcon size={10} />
          {auth.label}
        </span>
        {expanded ? <ChevronDown size={14} style={{ color: "#7777aa" }} /> : <ChevronRight size={14} style={{ color: "#7777aa" }} />}
      </button>

      {expanded && (
        <div className="px-5 py-4 space-y-4" style={{ background: "rgba(10,10,20,0.5)" }}>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm" style={{ color: "#7777aa" }}>{ep.description}</p>
            <button
              onClick={copyEndpoint}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(119,119,170,0.1)" }}
              title="Copy URL"
            >
              {copied ? <Check size={13} style={{ color: "#44dd88" }} /> : <Copy size={13} style={{ color: "#7777aa" }} />}
            </button>
          </div>

          {ep.params && ep.params.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>QUERY PARAMETERS</p>
              <div
                className="rounded-xl overflow-hidden text-xs"
                style={{ border: "1px solid rgba(26,26,53,0.8)" }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(16,16,30,0.6)" }}>
                      <th className="text-left px-3 py-2 font-bold" style={{ color: "#7777aa" }}>Param</th>
                      <th className="text-left px-3 py-2 font-bold" style={{ color: "#7777aa" }}>Type</th>
                      <th className="text-left px-3 py-2 font-bold hidden sm:table-cell" style={{ color: "#7777aa" }}>Default</th>
                      <th className="text-left px-3 py-2 font-bold" style={{ color: "#7777aa" }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.params.map((p) => (
                      <tr key={p.name} style={{ borderTop: "1px solid rgba(26,26,53,0.5)" }}>
                        <td className="px-3 py-2">
                          <code className="font-mono" style={{ color: "#0099ff" }}>{p.name}</code>
                        </td>
                        <td className="px-3 py-2">
                          <span style={{ color: "#cc44ff" }}>{p.type}</span>
                        </td>
                        <td className="px-3 py-2 hidden sm:table-cell" style={{ color: "#7777aa" }}>
                          {p.default ?? "—"}
                        </td>
                        <td className="px-3 py-2" style={{ color: "#9999bb" }}>{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ep.body && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>REQUEST BODY</p>
              <pre
                className="text-xs font-mono p-4 rounded-xl overflow-x-auto"
                style={{ background: "rgba(7,7,15,0.8)", border: "1px solid rgba(26,26,53,0.8)", color: "#f0f0ff" }}
              >
                {ep.body}
              </pre>
            </div>
          )}

          {ep.response && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>EXAMPLE RESPONSE</p>
              <pre
                className="text-xs font-mono p-4 rounded-xl overflow-x-auto"
                style={{ background: "rgba(7,7,15,0.8)", border: "1px solid rgba(0,153,255,0.2)", color: "#f0f0ff" }}
              >
                {ep.response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  const totalEndpoints = SECTIONS.reduce((sum, s) => sum + s.endpoints.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Code2 size={28} style={{ color: "#ffdd00" }} />
          <h1 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>
            API Reference
          </h1>
        </div>
        <p className="text-base" style={{ color: "#7777aa" }}>
          Build your own ADOFAI tools with the ADOFAI.NET REST API.{" "}
          <span style={{ color: "#9999bb" }}>{totalEndpoints} endpoints</span> across maps, rankings, bookmarks, AI, and auth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,221,0,0.05)", border: "1px solid rgba(255,221,0,0.2)" }}>
          <h3 className="text-xs font-bold mb-1" style={{ color: "#ffdd00" }}>BASE URL</h3>
          <code className="text-sm font-mono" style={{ color: "#f0f0ff" }}>https://adofai.net/api</code>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "rgba(68,221,136,0.05)", border: "1px solid rgba(68,221,136,0.2)" }}>
          <h3 className="text-xs font-bold mb-1" style={{ color: "#44dd88" }}>FORMAT</h3>
          <p className="text-sm" style={{ color: "#f0f0ff" }}>JSON responses</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: "rgba(0,153,255,0.05)", border: "1px solid rgba(0,153,255,0.2)" }}>
          <h3 className="text-xs font-bold mb-1" style={{ color: "#0099ff" }}>RATE LIMIT</h3>
          <p className="text-sm" style={{ color: "#f0f0ff" }}>60 req/min</p>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-xl" style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: "#7777aa" }}>AUTHENTICATION</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Globe size={13} style={{ color: "#44dd88" }} />
            <span style={{ color: "#44dd88" }}>Public</span>
            <span style={{ color: "#7777aa" }}>— No authentication needed</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={13} style={{ color: "#ffaa00" }} />
            <span style={{ color: "#ffaa00" }}>Auth Required</span>
            <span style={{ color: "#7777aa" }}>— Login first via <code className="font-mono text-xs" style={{ color: "#0099ff" }}>POST /api/auth/login</code> (sets httpOnly cookie)</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={13} style={{ color: "#ff2244" }} />
            <span style={{ color: "#ff2244" }}>Admin Only</span>
            <span style={{ color: "#7777aa" }}>— Requires ADMIN or MODERATOR role</span>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-xl" style={{ background: "rgba(204,68,255,0.05)", border: "1px solid rgba(204,68,255,0.2)" }}>
        <h3 className="text-xs font-bold mb-2" style={{ color: "#cc44ff" }}>SORT VALUES FOR /api/maps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
          {SORT_VALUES.map((s) => (
            <div key={s.value} className="flex items-center gap-2">
              <code className="font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(204,68,255,0.1)", color: "#cc44ff" }}>
                {s.value}
              </code>
              <span style={{ color: "#7777aa" }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-4">
              <h2 className="text-lg font-black" style={{ color: "#f0f0ff" }}>{section.title}</h2>
              <p className="text-xs" style={{ color: "#7777aa" }}>{section.description}</p>
            </div>
            <div className="space-y-3">
              {section.endpoints.map((ep) => (
                <EndpointCard key={ep.method + ep.path} ep={ep} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-12 p-8 rounded-xl text-center"
        style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}
      >
        <h2 className="text-lg font-bold mb-2" style={{ color: "#f0f0ff" }}>
          Want more API features?
        </h2>
        <p className="text-sm mb-4" style={{ color: "#7777aa" }}>
          Submit a feature request or contribute to the open-source platform
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="https://github.com/3289david/adofai-verse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "rgba(255,221,0,0.1)", border: "1px solid rgba(255,221,0,0.25)", color: "#ffdd00" }}
          >
            GitHub
            <ArrowRight size={14} />
          </a>
          <a
            href="mailto:dev@adofai.net"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "rgba(0,153,255,0.1)", border: "1px solid rgba(0,153,255,0.25)", color: "#0099ff" }}
          >
            dev@adofai.net
          </a>
        </div>
      </div>
    </div>
  );
}
