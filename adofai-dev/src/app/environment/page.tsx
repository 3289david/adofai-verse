import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Environment (.env split)",
};

const IDP_ENV = `# adofai-oauth — copy to .env (safe to commit)
OAUTH_ISSUER="https://auth.adofai.net"
NEXT_PUBLIC_AUTH_ISSUER="https://auth.adofai.net"`;

const IDP_ENV_LOCAL = `# adofai-oauth — copy to .env.local (NEVER commit)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/adofai_community"
JWT_SECRET=""

RESEND_API_KEY=""
RESEND_FROM="ADOFAI Auth <onboarding@resend.dev>"

NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# Optional: password for prisma/seed.ts bootstrap user
# SEED_USER_PASSWORD="change-me-before-production"`;

const VERSE_ENV = `# adofai-verse — copy to .env (safe to commit)
NEXT_PUBLIC_APP_URL="https://adofai.net"
NEXT_PUBLIC_AUTH_ISSUER="https://auth.adofai.net"
OAUTH_ISSUER="https://auth.adofai.net"
OAUTH_CLIENT_ID="adofai_verse_web"`;

const VERSE_ENV_LOCAL = `# adofai-verse — copy to .env.local (NEVER commit)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/adofai_community"
JWT_SECRET=""

RESEND_API_KEY=""
RESEND_FROM="ADOFAI.NET <onboarding@resend.dev>"

NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

STEAM_API_KEY=""`;

const BATTLE_ENV = `# adofai-battle — copy to .env (safe to commit)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_AUTH_ISSUER="https://auth.adofai.net"
OAUTH_CLIENT_ID="adofai_online_contest"`;

const BATTLE_ENV_LOCAL = `# adofai-battle — copy to .env.local (NEVER commit)
#
# Battle is a public OAuth client — no client_secret.
# Register your redirect URI on the IdP first:
#   POST https://auth.adofai.net/api/oauth/register
#   { "redirect_uris": ["{NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback"] }
#
# Battle uses SQLite locally — no DATABASE_URL unless you extend the schema.`;

const DEV_ENV = `# adofai-dev — copy to .env (this app has no secrets)
NEXT_PUBLIC_AUTH_ISSUER="https://auth.adofai.net"`;

export default function EnvironmentPage() {
  return (
    <main className="dev-page">
      <h1>Environment: .env vs .env.local</h1>
      <p className="lead">
        Next.js reads <code>.env</code>, then overlays <code>.env.local</code> on top. Rule of thumb: public
        config (URLs, issuer strings, <code>NEXT_PUBLIC_*</code>) goes in{" "}
        <code>.env</code> and can be committed. Secrets (database password, JWT signing key, API keys)
        go in <code>.env.local</code> — gitignored by default.
      </p>
      <p className="prose">
        Each repo ships two template files:{" "}
        <code>.env.public.example</code> → rename to <code>.env</code>, and{" "}
        <code>.env.local.example</code> → rename to <code>.env.local</code>.
      </p>

      <h2>1 · OAuth IdP — <code>auth.adofai.net</code> (adofai-oauth)</h2>
      <pre className="code-block">{IDP_ENV}</pre>
      <pre className="code-block">{IDP_ENV_LOCAL}</pre>

      <h2>2 · ADOFAI.NET community site — <code>adofai.net</code> (adofai-verse)</h2>
      <p className="prose">
        OAuth callback <code>NEXT_PUBLIC_APP_URL + /api/auth/oauth/callback</code> must be registered on the IdP.
        If both apps share the same Postgres, <code>User.id</code> is the OAuth <code>sub</code>.
      </p>
      <pre className="code-block">{VERSE_ENV}</pre>
      <pre className="code-block">{VERSE_ENV_LOCAL}</pre>

      <h2>3 · Battle / contest (adofai-battle)</h2>
      <p className="prose">
        Public OAuth client — no <code>client_secret</code>. Uses SQLite for contest-specific data; links
        players via OAuth <code>sub</code> stored as <code>adofai_net_id</code>.
      </p>
      <pre className="code-block">{BATTLE_ENV}</pre>
      <pre className="code-block">{BATTLE_ENV_LOCAL}</pre>

      <h2>4 · This site — <code>dev.adofai.net</code> (adofai-dev)</h2>
      <p className="prose">No secrets. One public variable so the OAuth endpoint table auto-populates.</p>
      <pre className="code-block">{DEV_ENV}</pre>
    </main>
  );
}
