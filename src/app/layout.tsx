import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ADOFAI.VERSE — The Ultimate ADOFAI Platform",
  description:
    "The most advanced ADOFAI (A Dance of Fire and Ice) platform. Discover maps, track records, analyze patterns, and get AI-powered coaching.",
  keywords: ["ADOFAI", "A Dance of Fire and Ice", "rhythm game", "custom maps", "rankings"],
  icons: {
    icon: "/icon",
    shortcut: "/icon",
  },
  openGraph: {
    title: "ADOFAI.VERSE — The Ultimate ADOFAI Platform",
    description: "The most advanced ADOFAI community platform.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar user={user} />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
        <footer
          className="mt-24 py-8 text-center text-xs"
          style={{
            color: "#44445a",
            borderTop: "1px solid rgba(26,26,53,0.5)",
          }}
        >
          <p>
            ADOFAI.VERSE — Community platform for{" "}
            <span style={{ color: "#7777aa" }}>A Dance of Fire and Ice</span>
          </p>
          <p className="mt-1">
            Not affiliated with 7th Beat Games. AI powered by{" "}
            <a
              href="https://pollinations.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#7777aa" }}
              className="hover:underline"
            >
              Pollinations AI
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
