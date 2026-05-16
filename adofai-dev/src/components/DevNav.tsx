import Link from "next/link";

export default function DevNav() {
  return (
    <header className="dev-nav">
      <Link href="/" className="dev-nav-brand">
        ADOFAI Developers
      </Link>
      <span className="dev-nav-tag">dev.adofai.net</span>
      <nav className="dev-nav-links" aria-label="Developer navigation">
        <Link href="/">Hub</Link>
        <Link href="/environment">.env split</Link>
        <Link href="/oauth">OAuth &amp; API</Link>
        <a
          href="https://auth.adofai.net/.well-known/oauth-authorization-server"
          target="_blank"
          rel="noreferrer"
        >
          Discovery JSON
        </a>
        <a href="https://auth.adofai.net/login" target="_blank" rel="noreferrer">
          Try login
        </a>
        <a href="https://adofai.net" target="_blank" rel="noreferrer">
          adofai.net
        </a>
      </nav>
    </header>
  );
}
