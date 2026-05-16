import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OAuth & API endpoints",
};

const ENDPOINTS = [
  {
    label: "Authorization Server Metadata",
    path: "/.well-known/oauth-authorization-server",
    method: "GET",
    note: "RFC 8414 discovery — always load endpoints from here, not hardcoded paths.",
  },
  {
    label: "Authorization",
    path: "/oauth/authorize",
    method: "GET",
    note: "Redirect the user here with client_id, redirect_uri, response_type=code, scope, code_challenge (S256), state.",
  },
  {
    label: "Token",
    path: "/api/oauth/token",
    method: "POST",
    note: "Exchange code + code_verifier. Returns access_token, id_token (JWT), token_type, expires_in.",
  },
  {
    label: "Dynamic registration",
    path: "/api/oauth/register",
    method: "POST",
    note: 'Body: {"redirect_uris":["https://…"]}. Returns client_id. PKCE required (public client).',
  },
  {
    label: "UserInfo",
    path: "/api/oauth/userinfo",
    method: "GET",
    note: "Authorization: Bearer <access_token>. Returns sub, email, username, country.",
  },
  {
    label: "JWKS",
    path: "/api/oauth/jwks",
    method: "GET",
    note: "JSON Web Key Set — use to verify JWT signatures client-side.",
  },
  {
    label: "Revoke",
    path: "/api/oauth/revoke",
    method: "POST",
    note: "Revoke an access_token or refresh_token.",
  },
];

export default function OAuthPage() {
  const issuer =
    process.env.NEXT_PUBLIC_AUTH_ISSUER?.replace(/\/$/, "") ?? "https://auth.adofai.net";

  return (
    <main className="dev-page">
      <h1>OAuth &amp; API endpoints</h1>
      <p className="lead">
        Issuer: <strong style={{ color: "var(--text)" }}>{issuer}</strong>
        <br />
        Always resolve the live discovery document first — never hardcode individual endpoint URLs in
        production code.
      </p>

      <p className="prose">
        Scopes supported: <code>openid</code>, <code>profile</code>, <code>email</code>
        .{" "}
        Grant type: <code>authorization_code</code> only. PKCE (<code>S256</code> or{" "}
        <code>plain</code>) required for public clients.
      </p>

      <div style={{ overflowX: "auto", marginTop: "1.5rem" }}>
        <table className="endpoint-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>URL</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map(({ label, path, method, note }) => (
              <tr key={path}>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "0.1rem 0.35rem",
                      borderRadius: 4,
                      background: method === "GET" ? "rgba(0,102,255,0.2)" : "rgba(255,136,0,0.2)",
                      color: method === "GET" ? "#88ccff" : "#ffaa66",
                      marginRight: "0.4rem",
                    }}
                  >
                    {method}
                  </span>
                  {label}
                </td>
                <td>
                  <code>
                    <a href={path}>{issuer + path}</a>
                  </code>
                </td>
                <td>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>PKCE flow example (TypeScript)</h2>
      <pre className="code-block">{`// 1. Generate PKCE pair
const verifier = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
  .replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=/g, "");

// 2. Redirect user
const params = new URLSearchParams({
  client_id: "your_client_id",
  redirect_uri: "https://yourapp.example/callback",
  response_type: "code",
  scope: "openid profile email",
  code_challenge: challenge,
  code_challenge_method: "S256",
  state: crypto.randomUUID(),
});
window.location.href = \`${issuer}/oauth/authorize?\${params}\`;

// 3. Exchange code (server-side)
const res = await fetch("${issuer}/api/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "your_client_id",
    redirect_uri: "https://yourapp.example/callback",
    code: searchParams.get("code")!,
    code_verifier: verifier,
  }),
});
const { access_token, id_token } = await res.json();

// 4. Get user info
const user = await fetch("${issuer}/api/oauth/userinfo", {
  headers: { Authorization: \`Bearer \${access_token}\` },
}).then(r => r.json());
// => { sub, email, username, country }`}</pre>

      <h2>Dynamic client registration</h2>
      <pre className="code-block">{`# Register a new OAuth client (PKCE public client — no secret)
curl -X POST ${issuer}/api/oauth/register \\
  -H "Content-Type: application/json" \\
  -d '{"redirect_uris":["https://yourapp.example/callback"]}'

# Returns:
# { "client_id": "abc123", "redirect_uris": [...], "grant_types": ["authorization_code"] }`}</pre>
    </main>
  );
}
