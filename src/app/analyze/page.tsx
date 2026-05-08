"use client";

import { useState } from "react";
import { Upload, BarChart2, Music, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { getDifficultyColor, formatDuration } from "@/lib/utils";

interface Result {
  title: string; artist: string; bpmMin: number; bpmMax: number;
  tileCount: number; duration: number; difficulty: number;
  bpmData: {time:number;bpm:number}[];
  sections: {name:string;diff:number}[];
  note: string;
}

const DEMO: Result = {
  title:"Demo Map", artist:"Demo Artist", bpmMin:120, bpmMax:240,
  tileCount:512, duration:180, difficulty:13,
  bpmData:[
    {time:0,bpm:120},{time:20,bpm:120},{time:40,bpm:160},{time:60,bpm:200},
    {time:80,bpm:240},{time:100,bpm:200},{time:120,bpm:120},{time:150,bpm:240},{time:180,bpm:120},
  ],
  sections:[
    {name:"Intro",diff:5},{name:"Verse",diff:9},{name:"Pre",diff:12},
    {name:"Chorus",diff:16},{name:"Drop",diff:18},{name:"Outro",diff:6},
  ],
  note:"Gradual buildup with a brutal drop. BPM doubles from 120 to 240 at the main section.",
};

export default function AnalyzePage() {
  const [drag,   setDrag]   = useState(false);
  const [result, setResult] = useState<Result|null>(null);
  const [busy,   setBusy]   = useState(false);

  function loadDemo() { setBusy(true); setTimeout(() => { setResult(DEMO); setBusy(false); }, 800); }

  function parseFile(file: File) {
    setBusy(true);
    const r = new FileReader();
    r.onload = e => {
      try {
        const d = JSON.parse(e.target?.result as string);
        const bpms = [d.settings?.bpm ?? 120];
        const bpmData = [{ time:0, bpm:bpms[0] }];
        const tiles = d.pathData?.length ?? d.angleData?.length ?? 0;
        setResult({
          title:   d.settings?.song    ?? file.name.replace(/\.[^.]+$/, ""),
          artist:  d.settings?.artist  ?? "Unknown",
          bpmMin:  Math.min(...bpms), bpmMax: Math.max(...bpms),
          tileCount: tiles, duration: Math.round(tiles*60/(d.settings?.bpm??120)),
          difficulty: Math.min(21, Math.max(1, Math.round(Math.log2(Math.max(...bpms)/60)*5 + tiles/100))),
          bpmData,
          sections: [{name:"Start",diff:5},{name:"Mid",diff:10},{name:"End",diff:7}],
          note: `Parsed from file. ${tiles} tiles, BPM: ${bpms[0]}.`,
        });
      } catch { alert("Could not parse file. Make sure it's a valid .adofai file."); }
      finally { setBusy(false); }
    };
    r.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Map Analyzer</h1>
        <p className="text-sm text-soft mt-1">Upload a .adofai file to visualize BPM changes and difficulty</p>
      </div>

      {!result && (
        <div>
          <label htmlFor="file-upload"
            onDragOver={e=>{e.preventDefault();setDrag(true)}}
            onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)parseFile(f);}}
            className={`block cursor-pointer border-2 border-dashed rounded-xl p-16 text-center transition-colors ${drag?"border-fire/50 bg-fire/5":"border-line hover:border-line-hi"}`}>
            <Upload size={36} className={`mx-auto mb-3 ${drag?"text-fire":"text-dim"}`} />
            <p className="font-bold text-white mb-1">Drop your .adofai file here</p>
            <p className="text-sm text-soft">or <span className="text-fire">click to browse</span></p>
          </label>
          <input id="file-upload" type="file" accept=".adofai,.json" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)parseFile(f);}} />

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-dim">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>
          <button onClick={loadDemo} disabled={busy}
            className="mt-4 w-full py-3 rounded-xl text-sm font-bold bg-fire-2/10 border border-fire-2/25 text-fire-2 hover:bg-fire-2/15 transition-colors disabled:opacity-50">
            {busy ? "Loading…" : "Try Demo Analysis"}
          </button>
        </div>
      )}

      {busy && <div className="flex justify-center py-24"><div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-fire-2" /></div>}

      {result && !busy && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card border border-line rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-fire-2/12 border border-fire-2/25 flex items-center justify-center">
                <Music size={16} className="text-fire-2" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">{result.title}</p>
                <p className="text-xs text-soft">{result.artist}</p>
              </div>
            </div>
            <button onClick={()=>setResult(null)} className="text-xs text-soft border border-line px-3 py-1.5 rounded-lg hover:border-line-hi transition-colors">
              Analyze another
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"Difficulty", val:<DifficultyBadge difficulty={result.difficulty} size="lg"/>, c:getDifficultyColor(result.difficulty)},
              {label:"BPM",        val:result.bpmMin===result.bpmMax?`${result.bpmMin}`:`${result.bpmMin}–${result.bpmMax}`, c:"#0077ff"},
              {label:"Tiles",      val:result.tileCount.toLocaleString(), c:"#cc44ff"},
              {label:"Duration",   val:formatDuration(result.duration),   c:"#44dd88"},
            ].map(({label,val,c})=>(
              <div key={label} className="bg-card border border-line rounded-xl p-4" style={{borderColor:`${c}22`}}>
                <p className="text-xs text-soft mb-1">{label}</p>
                <div className="text-lg font-black" style={{color:c}}>{val}</div>
              </div>
            ))}
          </div>

          {result.note && (
            <div className="flex gap-3 p-4 rounded-xl bg-fire-2/6 border border-fire-2/18">
              <AlertCircle size={15} className="text-fire-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">{result.note}</p>
            </div>
          )}

          <div className="bg-card border border-line rounded-xl p-5">
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Music size={13} className="text-ice" />BPM Timeline</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={result.bpmData} margin={{top:5,right:5,bottom:5,left:0}}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0077ff" stopOpacity={0.25}/><stop offset="95%" stopColor="#0077ff" stopOpacity={0.02}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" />
                <XAxis dataKey="time" tickFormatter={v=>`${v}s`} tick={{fill:"#6666aa",fontSize:11}} axisLine={{stroke:"#1e1e40"}} tickLine={false} />
                <YAxis tick={{fill:"#6666aa",fontSize:11}} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{background:"#111127",border:"1px solid #1e1e40",borderRadius:8,fontSize:12}} labelStyle={{color:"#6666aa"}} itemStyle={{color:"#0077ff"}} />
                <Area type="monotone" dataKey="bpm" stroke="#0077ff" strokeWidth={2} fill="url(#g)" dot={{fill:"#0077ff",r:3,strokeWidth:0}} activeDot={{r:5,fill:"#00ccff",strokeWidth:0}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-line rounded-xl p-5">
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart2 size={13} className="text-fire-2" />Section Difficulty</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={result.sections} margin={{top:5,right:5,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e40" vertical={false} />
                <XAxis dataKey="name" tick={{fill:"#6666aa",fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis domain={[0,21]} tick={{fill:"#6666aa",fontSize:11}} axisLine={false} tickLine={false} width={25} />
                <Tooltip contentStyle={{background:"#111127",border:"1px solid #1e1e40",borderRadius:8,fontSize:12}} labelStyle={{color:"#6666aa"}} cursor={{fill:"rgba(255,255,255,0.03)"}} />
                <Bar dataKey="diff" radius={[4,4,0,0]}>
                  {result.sections.map((s,i) => <Cell key={i} fill={getDifficultyColor(s.diff)} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
