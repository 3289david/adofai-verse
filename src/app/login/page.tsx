import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.oauth_err;
  let oauthErr: string | null = null;
  if (typeof raw === "string") {
    try {
      oauthErr = decodeURIComponent(raw);
    } catch {
      oauthErr = raw;
    }
  }

  const issuer = (process.env.NEXT_PUBLIC_AUTH_ISSUER ?? "https://auth.adofai.net").replace(/\/$/, "");

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
            You&apos;ll continue on{" "}
            <strong style={{ color: "#f0f0ff" }}>auth.adofai.net</strong> — same Turnstile, email, and verification
            flow as before, now on a dedicated identity host.
          </p>
        </div>

        {oauthErr && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)", color: "#ff8888" }}
          >
            {oauthErr}
          </div>
        )}

        <a
          href="/api/auth/oauth/start"
          className="block w-full py-3 rounded-xl font-bold text-sm text-center transition-all mb-4"
          style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white" }}
        >
          Continue with OAuth
        </a>

        <p className="text-center text-xs mb-4" style={{ color: "#555577" }}>
          New user?{" "}
          <Link href={`${issuer}/register`} className="font-medium" style={{ color: "#ff8800" }}>
            Create account on the IdP
          </Link>
        </p>

        <p className="text-center text-[11px] leading-relaxed" style={{ color: "#444466" }}>
          Third-party sites can register their own OAuth clients at{" "}
          <code style={{ color: "#666688" }}>{issuer}/api/oauth/register</code> — public PKCE clients only.
        </p>
      </div>
    </div>
  );
}
