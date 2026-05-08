"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/maps",     label: "Maps"      },
  { href: "/rankings", label: "Rankings"  },
  { href: "/analyze",  label: "Analyze"   },
  { href: "/ai",       label: "AI Coach"  },
  { href: "/api-docs", label: "API"       },
  { href: "/admin/import", label: "Import" },
];

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-page/90 backdrop-blur border-b border-line">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="w-7 h-7 rounded fire-btn flex items-center justify-center text-sm font-black">A</span>
          <span className="font-black text-base tracking-tight">
            <span className="fire-text">ADOFAI</span>
            <span className="text-white">.VERSE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                path.startsWith(href)
                  ? "bg-fire/10 text-fire border border-fire/20"
                  : "text-soft hover:text-white hover:bg-card"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login"    className="px-4 py-1.5 text-sm font-medium text-soft hover:text-white border border-line hover:border-line-hi rounded-lg transition-colors">Log in</Link>
          <Link href="/register" className="px-4 py-1.5 text-sm fire-btn">Sign Up</Link>
        </div>

        <button className="md:hidden p-2 text-soft" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-line px-4 py-3 flex flex-col gap-1 bg-page">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                path.startsWith(href) ? "bg-fire/10 text-fire" : "text-soft"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 mt-2 pt-2 border-t border-line">
            <Link href="/login"    onClick={() => setOpen(false)} className="flex-1 text-center py-2 text-sm text-soft border border-line rounded-lg">Log in</Link>
            <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2 text-sm fire-btn">Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
