import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
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
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
        <footer className="mt-24 py-10 border-t border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <p className="font-black text-sm text-white mb-1">
                  <span className="fire-text">ADOFAI</span>.NET
                </p>
                <p className="text-xs text-dim">Community platform for A Dance of Fire and Ice.</p>
                <p className="text-xs text-dim mt-0.5">Not affiliated with 7th Beat Games.</p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-soft">
                <Link href="/maps"     className="hover:text-white transition-colors">Maps</Link>
                <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
                <Link href="/analyze"  className="hover:text-white transition-colors">Analyze</Link>
                <Link href="/upload"   className="hover:text-white transition-colors">Upload Map</Link>
                <Link href="/api-docs" className="hover:text-white transition-colors">API</Link>
                <Link href="/terms"    className="hover:text-white transition-colors">Terms</Link>
                <Link href="/privacy"  className="hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
            <p className="text-xs text-dim mt-6">
              AI powered by{" "}
              <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="hover:text-soft transition-colors">
                Pollinations AI
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
