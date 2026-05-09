"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Flame, Eye, EyeOff, Check, Loader2, Shield, Mail } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { solvePoW } from "@/lib/pow-client";

export default function RegisterPage() {
  const [username,      setUsername]      = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPass,      setShowPass]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [done,          setDone]          = useState(false);

  // Anti-spam state
  const [turnstileToken, setTurnstileToken] = useState("");
  const [powToken,       setPowToken]       = useState("");
  const [powNonce,       setPowNonce]       = useState("");
  const [powReady,       setPowReady]       = useState(false);
  const [powStatus,      setPowStatus]      = useState<"idle" | "solving" | "ready">("idle");
  const formLoadedAt = useRef(Date.now());
  const powAbort     = useRef<AbortController | null>(null);

  const startPoW = useCallback(async () => {
    setPowStatus("solving");
    setPowReady(false);
    try {
      const res  = await fetch("/api/auth/pow");
      if (!res.ok) { setPowStatus("idle"); return; }
      const data = await res.json() as { challenge: string; difficulty: number; token: string };

      powAbort.current?.abort();
      powAbort.current = new AbortController();
      const nonce = await solvePoW(data.challenge, data.difficulty, powAbort.current.signal);
      setPowToken(data.token);
      setPowNonce(nonce);
      setPowReady(true);
      setPowStatus("ready");
    } catch {
      setPowStatus("idle");
    }
  }, []);

  useEffect(() => {
    startPoW();
    return () => powAbort.current?.abort();
  }, [startPoW]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          turnstile:    turnstileToken,
          powToken,
          powNonce,
          honeypot:     (document.getElementById("hp-website") as HTMLInputElement)?.value ?? "",
          formLoadedAt: formLoadedAt.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setPowReady(false);
        startPoW();
        return;
      }

      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm p-8 rounded-2xl text-center"
          style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#44dd88,#0077ff)" }}>
            <Mail size={22} color="white" />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "#f0f0ff" }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color: "#7777aa" }}>
            We sent a verification link to <strong style={{ color: "#f0f0ff" }}>{email}</strong>.
            Click it to activate your account.
          </p>
          <p className="text-xs mb-5" style={{ color: "#44445a" }}>
            Didn&#39;t get it? Check your spam folder or contact{" "}
            <a href="mailto:help@adofai.net" style={{ color: "#ff8800" }}>help@adofai.net</a>.
          </p>
          <Link href="/login"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg,#ff2244,#ff8800)" }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle = {
    background: "rgba(7,7,15,0.8)",
    border: "1px solid rgba(26,26,53,0.8)",
    color: "#f0f0ff",
  };

  const perks = [
    "Submit your personal records",
    "Track accuracy & improvement",
    "Get personalized AI coaching",
    "Appear on global rankings",
  ];

  // Simple password strength
  const pwStrength = password.length >= 16 && /[^a-zA-Z0-9]/.test(password) ? "strong"
    : password.length >= 10 ? "medium"
    : password.length >= 8  ? "weak"
    : "none";
  const pwColor = { strong: "#44dd88", medium: "#ff8800", weak: "#ff2244", none: "transparent" };
  const pwLabel = { strong: "Strong", medium: "Moderate", weak: "Weak", none: "" };

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col lg:flex-row gap-8">
        {/* Left: perks */}
        <div className="lg:flex-1">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}>
            <Flame size={22} color="white" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#f0f0ff" }}>Join ADOFAI.NET</h1>
          <p className="text-sm mb-6" style={{ color: "#7777aa" }}>The ultimate platform for ADOFAI players</p>
          <ul className="space-y-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm" style={{ color: "#7777aa" }}>
                <Check size={14} style={{ color: "#44dd88", flexShrink: 0 }} />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="lg:flex-1 p-8 rounded-2xl"
          style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)", color: "#ff8888" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot */}
            <input
              id="hp-website"
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
            />

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required pattern="^[a-zA-Z0-9_-]+$" minLength={3} maxLength={20}
                autoComplete="username"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
                placeholder="CoolPlayer_123" />
              <p className="text-xs mt-1" style={{ color: "#44445a" }}>3–20 chars, letters/numbers/_/-</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
                placeholder="you@example.com" />
              <p className="text-xs mt-1" style={{ color: "#44445a" }}>A verification link will be sent to this address.</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={8} maxLength={128}
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none" style={inputStyle}
                  placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#7777aa" }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password.length >= 8 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(26,26,53,0.8)" }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: pwStrength === "strong" ? "100%" : pwStrength === "medium" ? "66%" : "33%",
                      background: pwColor[pwStrength],
                    }} />
                  </div>
                  <span className="text-xs" style={{ color: pwColor[pwStrength] }}>{pwLabel[pwStrength]}</span>
                </div>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            <TurnstileWidget
              onToken={setTurnstileToken}
              onError={() => setError("Verification widget error. Please reload.")}
              onExpire={() => setTurnstileToken("")}
            />

            {/* PoW status */}
            {powStatus === "solving" && (
              <div className="flex items-center gap-2 text-xs" style={{ color: "#7777aa" }}>
                <Loader2 size={12} className="animate-spin flex-shrink-0" />
                Running security check in the background…
              </div>
            )}
            {powStatus === "ready" && (
              <div className="flex items-center gap-2 text-xs" style={{ color: "#44dd88" }}>
                <Shield size={12} className="flex-shrink-0" />
                Security check passed
              </div>
            )}

            <button type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white" }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#7777aa" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#ff8800" }} className="hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
