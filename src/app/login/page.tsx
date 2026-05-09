"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Flame, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { solvePoW } from "@/lib/pow-client";

export default function LoginPage() {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPass,      setShowPass]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  // Anti-spam state
  const [turnstileToken, setTurnstileToken] = useState("");
  const [powToken,       setPowToken]       = useState("");
  const [powNonce,       setPowNonce]       = useState("");
  const [powReady,       setPowReady]       = useState(false);
  const [powStatus,      setPowStatus]      = useState<"idle" | "solving" | "ready">("idle");
  const formLoadedAt = useRef(Date.now());
  const powAbort     = useRef<AbortController | null>(null);

  // Fetch PoW challenge and solve it in the background on mount
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
      // PoW failure is non-blocking — Turnstile + rate limiting remain as primary guards
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          turnstile:    turnstileToken,
          powToken,
          powNonce,
          honeypot:     (document.getElementById("hp-website") as HTMLInputElement)?.value ?? "",
          formLoadedAt: formLoadedAt.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        // Refresh PoW after failure
        setPowReady(false);
        startPoW();
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(7,7,15,0.8)",
    border: "1px solid rgba(26,26,53,0.8)",
    color: "#f0f0ff",
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}
      >
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
          >
            <Flame size={22} color="white" />
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#f0f0ff" }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7777aa" }}>
            Sign in to ADOFAI.NET
          </p>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)", color: "#ff8888" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot — hidden from real users, bots fill it */}
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                style={inputStyle}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#7777aa" }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Cloudflare Turnstile */}
          <TurnstileWidget
            onToken={setTurnstileToken}
            onError={() => setError("Verification widget error. Please reload.")}
            onExpire={() => setTurnstileToken("")}
            className="mt-1"
          />

          {/* PoW status indicator */}
          {powStatus === "solving" && (
            <div className="flex items-center gap-2 text-xs py-1" style={{ color: "#7777aa" }}>
              <Loader2 size={12} className="animate-spin flex-shrink-0" />
              Running security check…
            </div>
          )}
          {powStatus === "ready" && (
            <div className="flex items-center gap-2 text-xs py-1" style={{ color: "#44dd88" }}>
              <Shield size={12} className="flex-shrink-0" />
              Security check passed
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white" }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#7777aa" }}>
          Don&#39;t have an account?{" "}
          <Link href="/register" style={{ color: "#ff8800" }} className="hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
