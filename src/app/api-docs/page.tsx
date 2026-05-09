import { Code2, ArrowRight } from "lucide-react";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/maps",
    description: "List maps with filtering and pagination",
    params: [
      { name: "search", type: "string", desc: "Search by title, artist, or creator" },
      { name: "diffMin / diffMax", type: "number", desc: "Difficulty range (1–21+)" },
      { name: "bpmMin / bpmMax", type: "number", desc: "BPM range" },
      { name: "tags", type: "string[]", desc: "Filter by tags (#wave, #spam, etc.)" },
      { name: "sort", type: "string", desc: "popular | newest | difficulty_asc | difficulty_desc | bpm" },
      { name: "page / limit", type: "number", desc: "Pagination (max 100)" },
    ],
  },
  {
    method: "GET",
    path: "/api/maps/:id",
    description: "Get a single map with full data including records",
    params: [],
  },
  {
    method: "GET",
    path: "/api/rankings",
    description: "Global player rankings sorted by XP",
    params: [
      { name: "limit", type: "number", desc: "Number of results (max 100)" },
    ],
  },
  {
    method: "POST",
    path: "/api/ai/analyze",
    description: "AI map analysis using Pollinations AI",
    body: `{
  "map": {
    "id": "...",
    "title": "Song Name",
    "artist": "Artist",
    "difficulty": 15,
    "bpmMin": 180,
    "bpmMax": 360,
    "duration": 200,
    "tileCount": 650,
    "tags": ["#wave", "#precision"]
  }
}`,
  },
  {
    method: "POST",
    path: "/api/ai/coach",
    description: "ADOFAI AI coaching chat via Pollinations AI",
    body: `{
  "message": "How do I improve at wave maps?",
  "context": "Working on Difficulty 15 wave map at 180 BPM"
}`,
  },
];

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: "rgba(68,221,136,0.12)", color: "#44dd88" },
  POST: { bg: "rgba(0,153,255,0.12)", color: "#0099ff" },
  DELETE: { bg: "rgba(255,34,68,0.12)", color: "#ff2244" },
};

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Code2 size={28} style={{ color: "#ffdd00" }} />
          <h1 className="text-3xl font-black" style={{ color: "#f0f0ff" }}>
            Public API
          </h1>
        </div>
        <p className="text-base" style={{ color: "#7777aa" }}>
          Build your own ADOFAI tools with the ADOFAI.NET REST API. Free to use,
          no authentication required for public endpoints.
        </p>
      </div>

      <div
        className="mb-8 p-5 rounded-xl"
        style={{
          background: "rgba(255,221,0,0.05)",
          border: "1px solid rgba(255,221,0,0.2)",
        }}
      >
        <h3 className="text-sm font-bold mb-2" style={{ color: "#ffdd00" }}>
          Base URL
        </h3>
        <code
          className="text-sm font-mono"
          style={{ color: "#f0f0ff" }}
        >
          https://adofai.net/api
        </code>
        <p className="text-xs mt-2" style={{ color: "#7777aa" }}>
          All responses are JSON. Rate limit: 60 requests/minute for public endpoints.
        </p>
      </div>

      <div className="space-y-6">
        {ENDPOINTS.map((ep) => {
          const mc = METHOD_COLORS[ep.method] ?? { bg: "rgba(119,119,170,0.12)", color: "#7777aa" };
          return (
            <div
              key={ep.path + ep.method}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(26,26,53,0.8)" }}
            >
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ background: "rgba(16,16,30,0.9)" }}
              >
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-black font-mono"
                  style={{ background: mc.bg, color: mc.color }}
                >
                  {ep.method}
                </span>
                <code className="text-sm font-mono font-bold" style={{ color: "#f0f0ff" }}>
                  {ep.path}
                </code>
              </div>
              <div className="px-5 py-4" style={{ background: "rgba(10,10,20,0.5)" }}>
                <p className="text-sm mb-4" style={{ color: "#7777aa" }}>
                  {ep.description}
                </p>

                {"params" in ep && ep.params && ep.params.length > 0 && (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>
                      QUERY PARAMETERS
                    </p>
                    <div className="space-y-2">
                      {ep.params!.map((p) => (
                        <div key={p.name} className="flex items-start gap-3 text-sm">
                          <code
                            className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: "rgba(0,153,255,0.1)",
                              color: "#0099ff",
                              border: "1px solid rgba(0,153,255,0.2)",
                            }}
                          >
                            {p.name}
                          </code>
                          <span style={{ color: "#7777aa" }}>
                            <span style={{ color: "#cc44ff" }}>{p.type}</span>{" "}
                            — {p.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {"body" in ep && ep.body && (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: "#7777aa" }}>
                      REQUEST BODY
                    </p>
                    <pre
                      className="text-xs font-mono p-4 rounded-xl overflow-x-auto"
                      style={{
                        background: "rgba(7,7,15,0.8)",
                        border: "1px solid rgba(26,26,53,0.8)",
                        color: "#f0f0ff",
                      }}
                    >
                      {ep.body}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-12 p-8 rounded-xl text-center"
        style={{
          background: "rgba(16,16,30,0.6)",
          border: "1px solid rgba(26,26,53,0.8)",
        }}
      >
        <h2 className="text-lg font-bold mb-2" style={{ color: "#f0f0ff" }}>
          Want more API features?
        </h2>
        <p className="text-sm mb-4" style={{ color: "#7777aa" }}>
          Submit a feature request or contribute to the open-source platform
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{
              background: "rgba(255,221,0,0.1)",
              border: "1px solid rgba(255,221,0,0.25)",
              color: "#ffdd00",
            }}
          >
            GitHub
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
