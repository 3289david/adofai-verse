import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { ScrollToTop } from "@/components/ScrollToTop";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ADOFAI.NET — The Ultimate ADOFAI Platform",
  description:
    "The most advanced ADOFAI (A Dance of Fire and Ice) platform. Discover maps, track records, analyze patterns, and get AI-powered coaching.",
  keywords: ["ADOFAI", "A Dance of Fire and Ice", "rhythm game", "custom maps", "rankings"],
  icons: { icon: "/icon", shortcut: "/icon" },
  openGraph: {
    title: "ADOFAI.NET — The Ultimate ADOFAI Platform",
    description: "The most advanced ADOFAI community platform.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar user={user} />
        <ToastProvider>
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
        </ToastProvider>
        <ScrollToTop />
        <footer className="mt-24 py-10 border-t border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1: Branding */}
              <div>
                <p className="font-black text-sm text-white mb-2">
                  <span className="fire-text">ADOFAI</span>.NET
                </p>
                <p className="text-xs text-dim leading-relaxed mb-1">
                  Unofficial fan community platform for A Dance of Fire and Ice.
                </p>
                <p className="text-xs text-dim leading-relaxed mb-3">
                  ADOFAI and A Dance of Fire and Ice are trademarks of <strong className="text-soft">7th Beat Games</strong>. This site is not affiliated with, endorsed by, or sponsored by 7th Beat Games.
                </p>
                <a href="https://github.com/3289david/adofai-verse" target="_blank" rel="noopener noreferrer" className="text-xs text-soft hover:text-white transition-colors">
                  GitHub
                </a>
              </div>

              {/* Column 2: Platform */}
              <div>
                <p className="text-xs font-bold text-white mb-3">Platform</p>
                <div className="flex flex-col gap-2 text-xs text-soft">
                  <Link href="/maps" className="hover:text-white transition-colors">Maps</Link>
                  <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
                  <Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link>
                  <Link href="/upload" className="hover:text-white transition-colors">Upload Map</Link>
                  <Link href="/ai" className="hover:text-white transition-colors">AI Coach</Link>
                </div>
              </div>

              {/* Column 3: Resources */}
              <div>
                <p className="text-xs font-bold text-white mb-3">Resources</p>
                <div className="flex flex-col gap-2 text-xs text-soft">
                  <Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link>
                  <Link href="/about" className="hover:text-white transition-colors">About</Link>
                  <a href="https://github.com/3289david/adofai-verse" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                </div>
              </div>

              {/* Column 4: Legal & Contact */}
              <div>
                <p className="text-xs font-bold text-white mb-3">Legal &amp; Contact</p>
                <div className="flex flex-col gap-2 text-xs text-soft">
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/dmca" className="hover:text-white transition-colors">DMCA / Copyright</Link>
                  <a href="mailto:contact@adofai.net" className="hover:text-white transition-colors">contact@adofai.net</a>
                  <a href="mailto:help@adofai.net" className="hover:text-white transition-colors">help@adofai.net</a>
                  <a href="mailto:legal@adofai.net" className="hover:text-white transition-colors">legal@adofai.net</a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-line text-xs text-dim">
              &copy; 2026 ADOFAI.NET &middot; AI powered by{" "}
              <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="hover:text-soft transition-colors">
                Pollinations AI
              </a>
              {" "}&middot;{" "}
              <a href="mailto:dev@adofai.net" className="hover:text-soft transition-colors">dev@adofai.net</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
