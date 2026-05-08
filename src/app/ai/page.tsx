"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Send, User, Sparkles, RefreshCw } from "lucide-react";
import type { MapData } from "@/lib/types";

interface Msg { id: string; role: "user"|"assistant"; content: string; loading?: boolean; }

const PROMPTS = [
  "How do I improve accuracy on high BPM maps?",
  "What's the difference between wave and stream patterns?",
  "How do I prepare for my first difficulty 15 clear?",
  "Why do I keep failing at BPM doublings?",
];

export default function AICoachPage() {
  const [msgs,  setMsgs]  = useState<Msg[]>([{ id:"0", role:"assistant", content:"Hey! I'm your ADOFAI AI Coach. Ask me anything — improving accuracy, understanding patterns, or choosing maps to practice." }]);
  const [input, setInput] = useState("");
  const [mapId, setMapId] = useState("");
  const [busy,  setBusy]  = useState(false);
  const [maps,  setMaps]  = useState<MapData[]>([]);
  const bottom            = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/maps?limit=100&sort=popular")
      .then(r => r.json())
      .then(d => setMaps(d.maps ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const mapData = maps.find(m => m.id === mapId);
    const context = mapData ? `User is working on "${mapData.title}" by ${mapData.artist}, difficulty ${mapData.difficulty}.` : "";

    setMsgs(p => [...p, { id: Date.now()+"u", role:"user", content:text }, { id:"loading", role:"assistant", content:"", loading:true }]);
    setInput("");
    setBusy(true);

    try {
      const r = await fetch("/api/ai/coach", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ message:text, context }) });
      const d = await r.json();
      setMsgs(p => p.map(m => m.id === "loading" ? { id:Date.now()+"a", role:"assistant", content:d.response } : m));
    } catch {
      setMsgs(p => p.map(m => m.id === "loading" ? { id:Date.now()+"a", role:"assistant", content:"Sorry, couldn't connect. Please try again." } : m));
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col" style={{height:"calc(100vh - 56px)"}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2"><Brain size={20} className="text-ultra" />AI Coach</h1>
          <p className="text-xs text-soft mt-0.5">Powered by Pollinations AI · Free for everyone</p>
        </div>
        <button onClick={() => { setMsgs([{ id:"0", role:"assistant", content:"Chat reset! How can I help?" }]); setMapId(""); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-soft border border-line rounded-lg hover:border-line-hi transition-colors">
          <RefreshCw size={11} />Reset
        </button>
      </div>

      {/* Map context */}
      <div className="mb-3 flex-shrink-0">
        <select value={mapId} onChange={e => setMapId(e.target.value)}
          className="w-full bg-card border border-line rounded-xl px-3 py-2.5 text-sm text-soft outline-none hover:border-line-hi">
          <option value="" style={{background:"#111127"}}>📋 Add map context (optional)</option>
          {maps.map(m => <option key={m.id} value={m.id} style={{background:"#111127"}}>[{m.difficulty}] {m.title} — {m.artist}</option>)}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-card border border-line rounded-xl p-4 space-y-4 mb-3">
        {msgs.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role==="user" ? "bg-fire" : "bg-ultra/80"}`}>
              {msg.role==="user" ? <User size={13} color="white" /> : <Brain size={13} color="white" />}
            </div>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role==="user" ? "bg-fire/15 border border-fire/20 rounded-tr-sm" : "bg-page border border-line rounded-tl-sm"} text-white`}>
              {msg.loading
                ? <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-ultra animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}</span>
                : msg.content}
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
        {PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} disabled={busy}
            className="flex-shrink-0 text-xs px-3 py-1.5 bg-ultra/8 border border-ultra/20 text-soft rounded-xl whitespace-nowrap hover:border-ultra/40 transition-colors disabled:opacity-50">
            <Sparkles size={9} className="inline mr-1" />{p.length > 30 ? p.slice(0,30)+"…" : p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mt-2 flex gap-2 flex-shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(input); }}}
          placeholder="Ask anything… (Enter to send)"
          rows={2}
          disabled={busy}
          className="flex-1 bg-card border border-line rounded-xl px-4 py-3 text-sm text-white placeholder:text-soft outline-none resize-none focus:border-line-hi disabled:opacity-50"
        />
        <button onClick={() => send(input)} disabled={busy || !input.trim()}
          className="px-4 rounded-xl text-white disabled:opacity-40 self-stretch"
          style={{background:"linear-gradient(135deg,#cc44ff,#0077ff)"}}>
          <Send size={15} />
        </button>
      </div>
      <p className="text-center text-xs text-dim mt-2">AI responses may not always be accurate</p>
    </div>
  );
}
