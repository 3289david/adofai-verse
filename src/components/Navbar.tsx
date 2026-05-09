"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, Shield, Upload, User } from "lucide-react";
import type { AuthUser } from "@/lib/types";

const LINKS = [
  { href: "/maps",     label: "Maps"     },
  { href: "/rankings", label: "Rankings" },
  { href: "/analyze",  label: "Analyze"  },
  { href: "/ai",       label: "AI Coach" },
  { href: "/upload",   label: "Upload"   },
  { href: "/bookmarks", label: "Saved"  },
  { href: "/about",    label: "About"    },
];

interface NavbarProps {
  user: AuthUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const path = usePathname();
  const [open,        setOpen]        = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    window.location.href = "/";
  }

  const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

  return (
    <header className="sticky top-0 z-50 bg-page/90 backdrop-blur border-b border-line">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="logo-g" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff2244"/>
                <stop offset="0.5" stopColor="#cc33ff"/>
                <stop offset="1" stopColor="#0077ff"/>
              </linearGradient>
            </defs>
            <rect width="28" height="28" rx="6" fill="url(#logo-g)"/>
            <rect x="9" y="9" width="10" height="10" rx="1.5" fill="white" transform="rotate(45 14 14)"/>
          </svg>
          <span className="font-black text-base tracking-tight">
            <span className="fire-text">ADOFAI</span>
            <span className="text-white">.NET</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                path.startsWith(href)
                  ? "bg-fire/10 text-fire border border-fire/20"
                  : "text-soft hover:text-white hover:bg-card"
              }`}>
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/import"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                path.startsWith("/admin")
                  ? "bg-ultra/10 text-ultra border border-ultra/20"
                  : "text-dim hover:text-soft hover:bg-card"
              }`}>
              <Upload size={11} />Import
            </Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-ultra/10 text-ultra border border-ultra/20">
                  <Shield size={10} />{user.role}
                </span>
              )}
              <Link href={`/profile/${user.username}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-soft hover:text-white border border-transparent hover:border-line rounded-lg transition-colors">
                <User size={13} />{user.username}
              </Link>
              <button onClick={handleLogout} disabled={loggingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-soft border border-line hover:border-line-hi hover:text-white rounded-lg transition-colors disabled:opacity-50">
                <LogOut size={13} />{loggingOut ? "…" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login"    className="px-4 py-1.5 text-sm font-medium text-soft hover:text-white border border-line hover:border-line-hi rounded-lg transition-colors">Log in</Link>
              <Link href="/register" className="px-4 py-1.5 text-sm fire-btn">Sign Up</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-soft" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line px-4 py-3 flex flex-col gap-1 bg-page">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                path.startsWith(href) ? "bg-fire/10 text-fire" : "text-soft"
              }`}>
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/import" onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-dim flex items-center gap-1.5">
              <Upload size={12} />Import Data
            </Link>
          )}
          <div className="mt-2 pt-2 border-t border-line">
            {user ? (
              <div className="flex items-center justify-between">
                <Link href={`/profile/${user.username}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-ultra/10 text-ultra border border-ultra/20">
                      {user.role}
                    </span>
                  )}
                  <span className="text-sm font-medium text-white">{user.username}</span>
                </Link>
                <button onClick={handleLogout} disabled={loggingOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-soft rounded-lg border border-line disabled:opacity-50">
                  <LogOut size={13} />{loggingOut ? "…" : "Log out"}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login"    onClick={() => setOpen(false)} className="flex-1 text-center py-2 text-sm text-soft border border-line rounded-lg">Log in</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2 text-sm fire-btn">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
