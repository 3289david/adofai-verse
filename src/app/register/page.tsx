"use client";

import Link from "next/link";
import { Flame, ExternalLink } from "lucide-react";

/**
 * Accounts are provisioned on the IdP host (Turnstile, disposable-email blocklist, verification email — same logic as legacy /api/auth/register).
 */
export default function RegisterPage() {
  const issuer = (process.env.NEXT_PUBLIC_AUTH_ISSUER ?? "https://auth.adofai.net").replace(/\/$/, "");

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-md p-8 rounded-2xl text-center"
        style={{ background: "rgba(16,16,30,0.9)", border: "1px solid rgba(26,26,53,0.8)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
        >
          <Flame size={22} color="white" />
        </div>
        <h1 className="text-2xl font-black mb-2" style={{ color: "#f0f0ff" }}>
          Join ADOFAI.NET
        </h1>
        <p className="text-sm mb-6" style={{ color: "#7777aa", lineHeight: 1.6 }}>
          Registration lives on{" "}
          <strong style={{ color: "#f0f0ff" }}>auth.adofai.net</strong> with the same security stack (Cloudflare
          Turnstile, honeypots, timing checks, disposable-email blocking, and email verification via Resend when
          configured).
        </p>
        <a
          href={`${issuer}/register`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 justify-center w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-95"
          style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)" }}
        >
          Open registration <ExternalLink size={14} />
        </a>
        <p className="text-xs mt-5" style={{ color: "#44445a" }}>
          Integrators: register a public OAuth client at{" "}
          <code className="break-all text-[11px]" style={{ color: "#666688" }}>
            {issuer}/api/oauth/register
          </code>
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm font-medium" style={{ color: "#ff8800" }}>
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
