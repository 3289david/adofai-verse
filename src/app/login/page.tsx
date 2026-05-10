"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Flame, Eye, EyeOff, Shield, Loader2, Mail, AlertCircle } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");
  const formLoadedAt = useRef(Date.now());

  const [needsVerify,    setNeedsVerify]    = useState(false);
  const [verifyEmail,    setVerifyEmail]    = useState("");
  const [resending,      setResending]      = useState(false);
  const [resendStatus,   setResendStatus]   = useState<"idle" | "sent" | "error">("idle");
  const [resendError,    setResendError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!turnstileToken) {
      setError("Please complete the verification check first.");
      return;
    }

    setLoading(true);
    setError("");
    setNeedsVerify(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          turnstile:    turnstileToken,
          honeypot:     (document.getElementById("hp-website") as HTMLInputElement)?.value ?? "",
          formLoadedAt: formLoadedAt.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "EMAIL_NOT_VERIFIED") {
          setNeedsVerify(true);
          setVerifyEmail(data.email ?? email);
          setResendStatus("idle");
          setResendError("");
        } else {
          setError(data.error ?? "Login failed");
        }
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setResending(true);
    setResendError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendStatus("error");
        setResendError(data.error ?? "Failed to send email.");
      } else {
        setResendStatus("sent");
      }
    } catch {
      setResendStatus("error");
      setResendError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  const inputStyle = {
    background: "rgba(7,7,15,0.8)",
    border: "1px solid rgba(26,26,53,0.8)",
    color: "#f0f0ff",
  };

  if (needsVerify) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm p-8 rounded-2xl text-center"
          style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#ff8800,#ff2244)" }}>
            <Mail size={22} color="white" />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "#f0f0ff" }}>Verify Your Email</h2>
          <p className="text-sm mb-6" style={{ color: "#7777aa" }}>
            Please check <strong style={{ color: "#f0f0ff" }}>{verifyEmail}</strong> for a verification link.
            You need to verify your email before you can sign in.
          </p>

          {resendStatus === "sent" ? (
            <div className="flex items-center justify-center gap-2 text-sm mb-4 px-3 py-2 rounded-xl"
              style={{ background: "rgba(68,221,136,0.08)", border: "1px solid rgba(68,221,136,0.2)", color: "#44dd88" }}>
              <Shield size={14} />
              Verification email sent! Check your inbox.
            </div>
          ) : resendStatus === "error" ? (
            <div className="flex items-start gap-2 text-xs mb-4 px-3 py-2 rounded-xl text-left"
              style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)", color: "#ff8888" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{resendError}</span>
            </div>
          ) : null}

          <button onClick={resendVerification} disabled={resending}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
            style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white" }}>
            {resending && <Loader2 size={14} className="animate-spin" />}
            {resending ? "Sending…" : resendStatus === "sent" ? "Resend Again" : "Resend Verification Email"}
          </button>

          <p className="text-xs mb-4" style={{ color: "#44445a" }}>
            Check your spam folder if you don&#39;t see it. Need help? Contact{" "}
            <a href="mailto:help@adofai.net" style={{ color: "#ff8800" }}>help@adofai.net</a>.
          </p>

          <button onClick={() => { setNeedsVerify(false); setError(""); setResendStatus("idle"); }}
            className="text-sm hover:underline" style={{ color: "#ff8800" }}>
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

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

          <TurnstileWidget
            onToken={setTurnstileToken}
            onError={() => setError("Verification failed. Please reload.")}
            onExpire={() => { setTurnstileToken(""); setError("Verification expired — please try again."); }}
            className="mt-1"
          />

          {turnstileToken ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#44dd88" }}>
              <Shield size={11} className="flex-shrink-0" />
              Verified — ready to sign in
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#7777aa" }}>
              <Loader2 size={11} className="animate-spin flex-shrink-0" />
              Loading verification…
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
