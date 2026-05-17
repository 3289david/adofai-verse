"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const params = useSearchParams();
  const oauthErr = params.get("oauth_err");
  const next = params.get("next") ?? "/";

  const oauthUrl = `/api/auth/oauth/start?next=${encodeURIComponent(next)}`;

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
            <span className="text-white text-lg font-black">◇</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#f0f0ff" }}>
            Sign in to ADOFAI.NET
          </h1>
          <p className="text-sm mt-2" style={{ color: "#7777aa" }}>
            Use your ADOFAI account to continue.
          </p>
        </div>

        {oauthErr && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)", color: "#ff8888" }}
          >
            Sign-in error: {oauthErr}
          </div>
        )}

        <a
          href={oauthUrl}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
        >
          <span className="text-base font-black">◇</span>
          Continue with ADOFAI Account
        </a>

        <p className="text-center text-xs mt-6" style={{ color: "#444466" }}>
          Accounts are managed at{" "}
          <span style={{ color: "#7777aa" }}>auth.adofai.net</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
