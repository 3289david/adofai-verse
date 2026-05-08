"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Flame, BarChart2, Brain, Search, Trophy, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/maps", label: "Maps", icon: Search },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/analyze", label: "Analyze", icon: BarChart2 },
  { href: "/ai", label: "AI Coach", icon: Brain },
  { href: "/api-docs", label: "API", icon: Code2 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(7,7,15,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(26,26,53,0.8)",
      }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-7 h-7 rounded flex items-center justify-center transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #ff2244, #ff8800)",
            }}
          >
            <Flame size={14} color="white" />
          </div>
          <span
            className="font-black text-lg tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ff2244, #ff8800, #cc44ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ADOFAI<span style={{ WebkitTextFillColor: "#f0f0ff", backgroundClip: "unset" }}>.VERSE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "text-white"
                    : "text-[#7777aa] hover:text-white"
                )}
                style={
                  active
                    ? {
                        background: "rgba(255,34,68,0.12)",
                        border: "1px solid rgba(255,34,68,0.25)",
                        color: "#ff8888",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              color: "#7777aa",
              border: "1px solid rgba(26,26,53,0.8)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f0f0ff";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(46,46,90,1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#7777aa";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(26,26,53,0.8)";
            }}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 text-sm font-bold rounded-lg transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #ff2244, #ff8800)",
              color: "white",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.88";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Sign Up
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#7777aa" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid rgba(26,26,53,0.8)" }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  color: active ? "#ff8888" : "#7777aa",
                  background: active ? "rgba(255,34,68,0.1)" : "transparent",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(26,26,53,0.8)" }}>
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2 text-sm rounded-lg"
              style={{ color: "#7777aa", border: "1px solid rgba(26,26,53,0.8)" }}
            >
              Log in
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2 text-sm font-bold rounded-lg"
              style={{ background: "linear-gradient(135deg, #ff2244, #ff8800)", color: "white" }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
