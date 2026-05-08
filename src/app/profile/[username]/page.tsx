"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { MapPin, Trophy, Music, Edit2, Check, X, Camera, Globe } from "lucide-react";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { getDifficultyColor, formatNumber } from "@/lib/utils";

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
    id: string; accuracy: number; cleared: boolean; score: number; xp: number; createdAt: string;
    map: { id: string; title: string; artist: string; difficulty: number };
  }[];
  _count: { records: number; createdMaps: number };
}

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
          {profile.records.length === 0 ? (
            <div className="p-10 text-center text-soft text-sm">No records yet.</div>
          ) : (
            profile.records.map((rec, i) => (
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
