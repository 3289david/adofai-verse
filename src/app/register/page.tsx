"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-sm p-8 rounded-2xl text-center"
        style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
        >
          <span className="text-white text-lg font-black">◇</span>
        </div>
        <h1 className="text-2xl font-black mb-2" style={{ color: "#f0f0ff" }}>
          Create an Account
        </h1>
        <p className="text-sm mb-6" style={{ color: "#7777aa" }}>
          ADOFAI.NET accounts are managed through{" "}
          <strong style={{ color: "#f0f0ff" }}>auth.adofai.net</strong>.
          Register there, then sign in here.
        </p>
        <a
          href="https://auth.adofai.net/register"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white mb-3 transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
        >
          Register at auth.adofai.net
        </a>
        <Link
          href="/login"
          className="block w-full py-3 rounded-xl font-bold text-sm text-center transition-opacity hover:opacity-80"
          style={{ background: "rgba(40,40,80,0.6)", color: "#aaaacc" }}
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
