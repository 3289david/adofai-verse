"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Send, User, Sparkles, RefreshCw, Map } from "lucide-react";
import { MOCK_MAPS } from "@/lib/mock-data";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { formatBpm } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

const QUICK_PROMPTS = [
  "How do I improve my accuracy on high BPM maps?",
  "What's the difference between wave and stream patterns?",
  "How should I practice for my first 15+ difficulty clear?",
  "Why do I keep failing at BPM doublings?",
  "What's the best way to handle polyrhythm sections?",
  "Suggest a training path from difficulty 10 to 15",
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #ff2244, #ff8800)"
            : "linear-gradient(135deg, #cc44ff, #0099ff)",
        }}
      >
        {isUser ? (
          <User size={14} color="white" />
        ) : (
          <Brain size={14} color="white" />
        )}
      </div>

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
        style={{
          background: isUser
            ? "linear-gradient(135deg, rgba(255,34,68,0.15), rgba(255,136,0,0.1))"
            : "rgba(16,16,30,0.9)",
          border: isUser
            ? "1px solid rgba(255,34,68,0.25)"
            : "1px solid rgba(26,26,53,0.8)",
          color: "#f0f0ff",
        }}
      >
        {message.loading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    background: "#cc44ff",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span style={{ color: "#7777aa" }}>AI is thinking…</span>
          </div>
        ) : (
          <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
        )}
      </div>
    </div>
  );
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm your ADOFAI AI Coach. Ask me anything about improving your skills, understanding maps, or planning your practice. You can also select a map below to give me context about what you're working on.",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedMap, setSelectedMap] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    const loadingMsg: Message = {
      id: "loading",
      role: "assistant",
      content: "",
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = selectedMap
        ? MOCK_MAPS.find((m) => m.id === selectedMap)
          ? `The user is currently working on "${MOCK_MAPS.find((m) => m.id === selectedMap)?.title}" by ${MOCK_MAPS.find((m) => m.id === selectedMap)?.artist}, difficulty ${MOCK_MAPS.find((m) => m.id === selectedMap)?.difficulty}, BPM ${formatBpm(MOCK_MAPS.find((m) => m.id === selectedMap)!.bpmMin, MOCK_MAPS.find((m) => m.id === selectedMap)!.bpmMax)}.`
          : ""
        : "";

      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context }),
      });

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading"
            ? { id: Date.now().toString(), role: "assistant", content: data.response }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading"
            ? {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, I couldn't get a response. Please try again.",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Chat reset! How can I help you improve your ADOFAI skills today?",
      },
    ]);
    setSelectedMap("");
  }

  const selectedMapData = MOCK_MAPS.find((m) => m.id === selectedMap);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col h-[calc(100vh-56px)]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "#f0f0ff" }}>
            <Brain size={22} style={{ color: "#cc44ff" }} />
            AI Coach
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7777aa" }}>
            Powered by Pollinations AI · Free for everyone
          </p>
        </div>
        <button
          onClick={resetChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: "#7777aa", border: "1px solid rgba(26,26,53,0.8)" }}
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {selectedMapData && (
        <div
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3 flex-shrink-0"
          style={{
            background: "rgba(204,68,255,0.06)",
            border: "1px solid rgba(204,68,255,0.2)",
          }}
        >
          <Map size={14} style={{ color: "#cc44ff", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "#f0f0ff" }}>
              Context: {selectedMapData.title}
            </p>
            <p className="text-xs" style={{ color: "#7777aa" }}>
              {selectedMapData.artist} · {formatBpm(selectedMapData.bpmMin, selectedMapData.bpmMax)}
            </p>
          </div>
          <DifficultyBadge difficulty={selectedMapData.difficulty} size="sm" />
          <button
            onClick={() => setSelectedMap("")}
            className="text-xs" style={{ color: "#44445a" }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto rounded-xl p-4 space-y-4 mb-4"
        style={{
          background: "rgba(10,10,20,0.5)",
          border: "1px solid rgba(26,26,53,0.8)",
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
              style={{
                background: "rgba(204,68,255,0.08)",
                border: "1px solid rgba(204,68,255,0.2)",
                color: "#cc88ff",
                whiteSpace: "nowrap",
              }}
            >
              <Sparkles size={10} className="inline mr-1" />
              {prompt.length > 35 ? prompt.slice(0, 35) + "…" : prompt}
            </button>
          ))}
        </div>

        <div
          className="flex items-start gap-2 p-2 rounded-xl"
          style={{
            background: "rgba(16,16,30,0.9)",
            border: "1px solid rgba(26,26,53,0.8)",
          }}
        >
          <div className="flex-1">
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="w-full bg-transparent text-xs outline-none mb-1.5 pb-1.5"
              style={{
                color: "#7777aa",
                borderBottom: "1px solid rgba(26,26,53,0.6)",
              }}
            >
              <option value="" style={{ background: "#10101e" }}>
                📋 Add map context (optional)
              </option>
              {MOCK_MAPS.map((m) => (
                <option key={m.id} value={m.id} style={{ background: "#10101e" }}>
                  [{m.difficulty}] {m.title} — {m.artist}
                </option>
              ))}
            </select>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask anything about ADOFAI… (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="w-full bg-transparent text-sm outline-none resize-none"
              style={{ color: "#f0f0ff" }}
              disabled={loading}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="self-end p-2.5 rounded-xl transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #cc44ff, #0099ff)",
              color: "white",
            }}
          >
            <Send size={14} />
          </button>
        </div>

        <p className="text-center text-xs" style={{ color: "#44445a" }}>
          AI responses are generated by Pollinations AI and may not be perfectly accurate
        </p>
      </div>
    </div>
  );
}
