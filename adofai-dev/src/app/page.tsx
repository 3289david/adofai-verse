import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer Hub",
};

export default function HubPage() {
  return (
    <main className="dev-page">
      <span className="badge">dev.adofai.net</span>
      <h1>Developer Hub</h1>
      <p className="lead">
        Documentation for integrating with the ADOFAI community OAuth stack:{" "}
        <strong style={{ color: "var(--text)" }}>OAuth IdP</strong> at{" "}
        <a href="https://auth.adofai.net">auth.adofai.net</a>,{" "}
        <strong style={{ color: "var(--text)" }}>ADOFAI.NET</strong> at{" "}
        <a href="https://adofai.net">adofai.net</a>, and the{" "}
        <strong style={{ color: "var(--text)" }}>Battle / contest</strong> app.
      </p>

      <div className="dev-grid">
        <Link href="/environment" className="dev-card">
          <h2>.env vs .env.local</h2>
          <p>Copy-paste env bundles for all three apps — secrets stay in .env.local, URLs go in .env.</p>
        </Link>
        <Link href="/oauth" className="dev-card">
          <h2>OAuth endpoints</h2>
          <p>
            Live endpoint table: discovery, authorize, token, register, JWKS, userinfo, revoke.
          </p>
        </Link>
        <a
          href="https://auth.adofai.net/.well-known/oauth-authorization-server"
          target="_blank"
          rel="noreferrer"
          className="dev-card"
        >
          <h2>Discovery JSON</h2>
          <p>RFC 8414 Authorization Server Metadata — live from the IdP.</p>
        </a>
        <a
          href="https://auth.adofai.net/how-it-works"
          target="_blank"
          rel="noreferrer"
          className="dev-card"
        >
          <h2>Player-facing A→Z</h2>
          <p>Non-technical walkthrough on the IdP site for ordinary users.</p>
        </a>
      </div>

      <h2>Repos</h2>
      <ul className="prose">
        <li>
          <strong>OAuth IdP</strong>{" "}
          <a href="https://github.com/3289david/adofai-oauth">3289david/adofai-oauth</a> — deployed at{" "}
          <code>auth.adofai.net</code>
        </li>
        <li>
          <strong>Verse / community site</strong>{" "}
          <a href="https://github.com/3289david/adofai-verse">3289david/adofai-verse</a> — deployed at{" "}
          <code>adofai.net</code>
        </li>
        <li>
          <strong>Battle / contest</strong>{" "}
          <a href="https://github.com/3289david/adofai-battle">3289david/adofai-battle</a>
        </li>
        <li>
          <strong>This site</strong>{" "}
          <a href="https://github.com/3289david/adofai-dev">3289david/adofai-dev</a> — deployed at{" "}
          <code>dev.adofai.net</code>
        </li>
      </ul>

      <h2>Quick start — add OAuth to your app</h2>
      <ol className="prose">
        <li>
          Register a client:{" "}
          <code>POST https://auth.adofai.net/api/oauth/register</code> with{" "}
          <code>{`{"redirect_uris":["https://yourapp.example/callback"]}`}</code>.
          Returns <code>client_id</code> (no secret — public PKCE client).
        </li>
        <li>
          Generate a PKCE pair: <code>code_verifier</code> (random 43–128 chars) → SHA-256 →
          base64url → <code>code_challenge</code>.
        </li>
        <li>
          Redirect the user to <code>/oauth/authorize</code> with{" "}
          <code>response_type=code&scope=openid profile email&code_challenge_method=S256</code>.
        </li>
        <li>
          Exchange the returned <code>code</code> at{" "}
          <code>POST /api/oauth/token</code> with <code>code_verifier</code>. Receive{" "}
          <code>access_token</code> + <code>id_token</code>.
        </li>
        <li>
          Call <code>GET /api/oauth/userinfo</code> with <code>Authorization: Bearer &lt;access_token&gt;</code>{" "}
          to get <code>sub</code>, <code>email</code>, <code>username</code>.
        </li>
      </ol>
    </main>
  );
}
