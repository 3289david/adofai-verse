"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { MapPin, Trophy, Music, Edit2, Check, X, Camera, Zap, Target, Star, Repeat, Heart, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { getDifficultyColor, getDifficultyLabel, formatNumber } from "@/lib/utils";

interface ProfileUser {
  id:       string;
  username: string;
  avatar:   string | null;
  bio:      string | null;
  country:  string | null;
  role:     string;
  createdAt: string;
  createdMaps: {
    id: string; title: string; artist: string; difficulty: number;
    coverImage: string | null; likeCount: number; playCount: number;
  }[];
  records: {
    id: string; accuracy: number; cleared: boolean; score: number; xp: number;
    attempts: number; createdAt: string;
    map: { id: string; title: string; artist: string; difficulty: number };
  }[];
  _count: { records: number; createdMaps: number };
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const ACCURACY_BUCKETS = [
  { label: "0-60%", min: 0, max: 60 },
  { label: "60-70%", min: 60, max: 70 },
  { label: "70-80%", min: 70, max: 80 },
  { label: "80-90%", min: 80, max: 90 },
  { label: "90-95%", min: 90, max: 95 },
  { label: "95-100%", min: 95, max: 100.01 },
] as const;

const TIER_COLORS: Record<string, string> = {
  Beginner: "#44dd88",
  Easy: "#88ddff",
  Medium: "#ffdd00",
  Hard: "#ff8800",
  Extreme: "#ff2244",
  Ultra: "#cc44ff",
};

const COUNTRIES = [
  { code: "", name: "—" }, { code: "KR", name: "🇰🇷 Korea" },
  { code: "US", name: "🇺🇸 USA" }, { code: "JP", name: "🇯🇵 Japan" },
  { code: "CN", name: "🇨🇳 China" }, { code: "GB", name: "🇬🇧 UK" },
  { code: "DE", name: "🇩🇪 Germany" }, { code: "FR", name: "🇫🇷 France" },
  { code: "AU", name: "🇦🇺 Australia" }, { code: "CA", name: "🇨🇦 Canada" },
  { code: "BR", name: "🇧🇷 Brazil" }, { code: "RU", name: "🇷🇺 Russia" },
  { code: "PL", name: "🇵🇱 Poland" }, { code: "SE", name: "🇸🇪 Sweden" },
  { code: "NL", name: "🇳🇱 Netherlands" }, { code: "IT", name: "🇮🇹 Italy" },
];

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile,    setProfile]    = useState<ProfileUser | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [me,         setMe]         = useState<{ id: string; username: string } | null>(null);
  const [editing,    setEditing]    = useState(false);
  const [tab,        setTab]        = useState<"records" | "maps">("records");
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");
  const [editBio,    setEditBio]    = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/profile/${username}`).then(r => r.ok ? r.json() : null),
      fetch("/api/auth/me").then(r => r.ok ? r.json() : null),
    ]).then(([p, u]) => {
      setProfile(p);
      setMe(u);
      if (p) { setEditBio(p.bio ?? ""); setEditCountry(p.country ?? ""); }
      setLoading(false);
    });
  }, [username]);

  const isOwn = me?.username === username;

  async function saveProfile() {
    setSaving(true); setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: editBio, country: editCountry }),
      });
      if (!res.ok) { setSaveError("Save failed."); return; }
      const updated = await res.json();
      setProfile(p => p ? { ...p, bio: updated.bio, country: updated.country } : p);
      setEditing(false);
    } catch { setSaveError("Network error."); }
    finally  { setSaving(false); }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { alert("Upload failed."); return; }
      const { url } = await res.json();
      const res2 = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });
      if (res2.ok) setProfile(p => p ? { ...p, avatar: url } : p);
    } catch { alert("Upload error."); }
    finally  { setUploading(false); }
  }

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-fire" />
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-lg font-bold text-white">User not found</p>
      <Link href="/maps" className="text-fire text-sm hover:underline">← Back to Maps</Link>
    </div>
  );

  const totalXp = profile.records.reduce((s, r) => s + r.xp, 0);
  const cleared = profile.records.filter(r => r.cleared).length;
  const avgAcc  = profile.records.length
    ? profile.records.reduce((s, r) => s + r.accuracy, 0) / profile.records.length
    : 0;
  const bestScore = profile.records.reduce((max, r) => Math.max(max, r.score), 0);
  const totalAttempts = profile.records.reduce((s, r) => s + r.attempts, 0);

  const tierCounts: Record<string, number> = {};
  for (const rec of profile.records) {
    if (!rec.cleared) continue;
    const label = getDifficultyLabel(rec.map.difficulty);
    tierCounts[label] = (tierCounts[label] || 0) + 1;
  }
  const favoriteDifficulty = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const accuracyDistribution = ACCURACY_BUCKETS.map(b => ({
    name: b.label,
    count: profile.records.filter(r => r.accuracy >= b.min && r.accuracy < b.max).length,
  }));
  const accBarColors = ["#ff2244", "#ff8800", "#ffdd00", "#88ddff", "#44dd88", "#cc44ff"];

  const difficultyDistribution = Object.entries(tierCounts)
    .map(([name, value]) => ({ name, value, color: TIER_COLORS[name] || "#7777aa" }))
    .sort((a, b) => b.value - a.value);

  const recentRecords = [...profile.records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const recordsSortedByAccuracy = [...profile.records].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div className="bg-card border border-line rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-line border-2 border-line overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-soft">{profile.username[0].toUpperCase()}</span>
              )}
            </div>
            {isOwn && (
              <>
                <button onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-black text-white">{profile.username}</h1>
              {profile.role !== "PLAYER" && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-ultra/10 text-ultra border border-ultra/20">
                  {profile.role}
                </span>
              )}
            </div>
            {profile.country && (
              <p className="text-sm text-soft flex items-center gap-1 mb-2">
                <MapPin size={12} />{profile.country}
              </p>
            )}

            {editing ? (
              <div className="space-y-3 mt-3">
                <div>
                  <label className="text-xs text-soft mb-1 block">Bio / Memo</label>
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                    maxLength={500} rows={3}
                    placeholder="Share something about yourself…"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white resize-none" />
                  <p className="text-xs text-dim mt-1">{editBio.length}/500</p>
                </div>
                <div>
                  <label className="text-xs text-soft mb-1 block">Country</label>
                  <select value={editCountry} onChange={e => setEditCountry(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none bg-page border border-line focus:border-fire text-white">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                {saveError && <p className="text-xs text-fire">{saveError}</p>}
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 fire-btn text-sm disabled:opacity-50">
                    <Check size={13} />{saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => { setEditing(false); setSaveError(""); }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-xl text-sm text-soft hover:border-line-hi transition-colors">
                    <X size={13} />Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {profile.bio ? (
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap mt-1">{profile.bio}</p>
                ) : isOwn ? (
                  <p className="text-sm text-dim italic mt-1">No bio yet — click Edit to add one.</p>
                ) : null}
                {isOwn && (
                  <button onClick={() => setEditing(true)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-line rounded-lg text-soft hover:border-line-hi transition-colors">
                    <Edit2 size={11} />Edit Profile
                  </button>
                )}
              </>
            )}

            <p className="text-xs text-dim mt-3">
              Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-5 border-t border-line grid grid-cols-4 gap-4 text-center">
          {[
            { label: "Total XP",   value: formatNumber(totalXp),     color: "#cc44ff" },
            { label: "Cleared",    value: cleared,                    color: "#44dd88" },
            { label: "Avg Acc",    value: `${avgAcc.toFixed(1)}%`,    color: "#0077ff" },
            { label: "Maps Made",  value: profile._count.createdMaps, color: "#ff8800" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
              <div className="text-xs text-soft mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary Cards */}
      {profile.records.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Total XP", value: formatNumber(totalXp), icon: <Zap size={16} />, color: "#cc44ff" },
              { label: "Maps Cleared", value: cleared.toString(), icon: <Trophy size={16} />, color: "#44dd88" },
              { label: "Avg Accuracy", value: `${avgAcc.toFixed(1)}%`, icon: <Target size={16} />, color: "#0066ff" },
              { label: "Best Score", value: formatNumber(bestScore), icon: <Star size={16} />, color: "#ffdd00" },
              { label: "Total Attempts", value: formatNumber(totalAttempts), icon: <Repeat size={16} />, color: "#ff8800" },
              { label: "Fav Difficulty", value: favoriteDifficulty, icon: <Heart size={16} />, color: TIER_COLORS[favoriteDifficulty] || "#7777aa" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-xl p-4"
                style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}>
                <div className="flex items-center gap-2 mb-2" style={{ color }}>{icon}<span className="text-xs font-medium" style={{ color: "#7777aa" }}>{label}</span></div>
                <div className="text-lg font-black tabular-nums" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Accuracy Distribution */}
            <div className="rounded-xl p-5"
              style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: "#f0f0ff" }}>Accuracy Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={accuracyDistribution} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: "#7777aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#7777aa", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: "#10101e", border: "1px solid rgba(26,26,53,0.8)", borderRadius: 8, color: "#f0f0ff", fontSize: 12 }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    formatter={(value: number) => [`${value} records`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {accuracyDistribution.map((_, i) => (
                      <Cell key={i} fill={accBarColors[i]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Difficulty Distribution */}
            <div className="rounded-xl p-5"
              style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: "#f0f0ff" }}>Cleared by Difficulty</h3>
              {difficultyDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: "#7777aa" }}>No cleared maps yet</div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie
                        data={difficultyDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={80}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {difficultyDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#10101e", border: "1px solid rgba(26,26,53,0.8)", borderRadius: 8, color: "#f0f0ff", fontSize: 12 }}
                        formatter={(value: number, name: string) => [`${value} maps`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {difficultyDistribution.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span style={{ color: "#f0f0ff" }}>{d.name}</span>
                        <span className="ml-auto tabular-nums font-bold" style={{ color: d.color }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          {recentRecords.length > 0 && (
            <div className="rounded-xl p-5 mb-6"
              style={{ background: "rgba(16,16,30,0.6)", border: "1px solid rgba(26,26,53,0.8)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#f0f0ff" }}>
                <Clock size={14} style={{ color: "#7777aa" }} />Recent Activity
              </h3>
              <div className="space-y-0">
                {recentRecords.map((rec, i) => (
                  <div key={rec.id} className="flex items-center gap-3 py-3 relative"
                    style={{ borderBottom: i < recentRecords.length - 1 ? "1px solid rgba(26,26,53,0.5)" : "none" }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getDifficultyColor(rec.map.difficulty) }} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/maps/${rec.map.id}`} className="text-sm font-medium hover:underline truncate block" style={{ color: "#f0f0ff" }}>
                        {rec.map.title}
                      </Link>
                      <span className="text-xs" style={{ color: "#7777aa" }}>{rec.map.artist}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums" style={{ color: getDifficultyColor(rec.map.difficulty) }}>
                          {rec.accuracy.toFixed(2)}%
                        </div>
                        <div className="text-xs tabular-nums" style={{ color: "#7777aa" }}>{formatNumber(rec.score)} pts</div>
                      </div>
                      {rec.cleared && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: "#0066ff", background: "rgba(0,102,255,0.1)" }}>CLEAR</span>
                      )}
                      <span className="text-xs w-14 text-right" style={{ color: "#7777aa" }}>{formatRelativeTime(rec.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["records", "maps"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? "bg-fire/10 border border-fire/25 text-fire" : "text-soft hover:text-white border border-transparent"
            }`}>
            {t === "records" ? <Trophy size={13} /> : <Music size={13} />}
            {t === "records" ? `Records (${profile._count.records})` : `Maps (${profile._count.createdMaps})`}
          </button>
        ))}
      </div>

      {/* Records */}
      {tab === "records" && (
        <div className="bg-card border border-line rounded-xl divide-y divide-line">
          {recordsSortedByAccuracy.length === 0 ? (
            <div className="p-10 text-center text-soft text-sm">No records yet.</div>
          ) : (
            recordsSortedByAccuracy.map((rec, i) => (
              <div key={rec.id} className="flex items-center gap-4 p-4 hover:bg-page/50 transition-colors">
                <div className="w-6 text-sm font-bold text-dim text-center">#{i + 1}</div>
                <DifficultyBadge difficulty={rec.map.difficulty} size="sm" />
                <div className="flex-1 min-w-0">
                  <Link href={`/maps/${rec.map.id}`} className="text-sm font-medium text-white hover:underline truncate block">
                    {rec.map.title}
                  </Link>
                  <p className="text-xs text-dim truncate">{rec.map.artist}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums" style={{ color: getDifficultyColor(rec.map.difficulty) }}>
                    {rec.accuracy.toFixed(2)}%
                  </div>
                  {rec.cleared && <div className="text-[10px] text-ice font-bold">CLEARED</div>}
                  <div className="text-xs text-dim">{rec.xp} XP</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Maps */}
      {tab === "maps" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {profile.createdMaps.length === 0 ? (
            <div className="col-span-full p-10 text-center text-soft text-sm bg-card border border-line rounded-xl">
              {isOwn ? (
                <>No maps yet. <Link href="/upload" className="text-fire hover:underline">Upload one!</Link></>
              ) : "No maps yet."}
            </div>
          ) : (
            profile.createdMaps.map(m => (
              <Link key={m.id} href={`/maps/${m.id}`}
                className="bg-card border border-line rounded-xl overflow-hidden hover:border-line-hi transition-colors">
                <div className="h-28 relative" style={{ background: `${getDifficultyColor(m.difficulty)}18` }}>
                  {m.coverImage && (
                    <img src={m.coverImage} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute bottom-2 left-2">
                    <DifficultyBadge difficulty={m.difficulty} size="sm" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white truncate">{m.title}</p>
                  <p className="text-xs text-soft truncate">{m.artist}</p>
                  <div className="flex gap-3 mt-2 text-xs text-dim">
                    <span>♥ {formatNumber(m.likeCount)}</span>
                    <span>▶ {formatNumber(m.playCount)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
