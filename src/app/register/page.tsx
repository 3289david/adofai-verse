"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Eye, EyeOff, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
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

  const perks = [
    "Submit your personal records",
    "Track accuracy & improvement",
    "Get personalized AI coaching",
    "Appear on global rankings",
  ];

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col lg:flex-row gap-8">
        <div className="lg:flex-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
          >
            <Flame size={22} color="white" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#f0f0ff" }}>
            Join ADOFAI.NET
          </h1>
          <p className="text-sm mb-6" style={{ color: "#7777aa" }}>
            The ultimate platform for ADOFAI players
          </p>
          <ul className="space-y-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm" style={{ color: "#7777aa" }}>
                <Check size={14} style={{ color: "#44dd88", flexShrink: 0 }} />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="lg:flex-1 p-8 rounded-2xl"
          style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}
        >
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)", color: "#ff8888" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                pattern="^[a-zA-Z0-9_-]+$"
                minLength={3}
                maxLength={20}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                placeholder="CoolPlayer_123"
              />
              <p className="text-xs mt-1" style={{ color: "#44445a" }}>
                3–20 chars, letters/numbers/_/-
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7777aa" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  minLength={8}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  placeholder="At least 8 characters"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#7777aa" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#ff8800" }} className="hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
