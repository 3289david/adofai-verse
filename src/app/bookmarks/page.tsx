"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import type { BookmarkData } from "@/lib/types";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then(async (res) => {
        if (res.status === 401) {
          setError("Log in to view your saved maps.");
          return;
        }
        const data = await res.json();
        setBookmarks(data);
      })
      .catch(() => setError("Failed to load bookmarks."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={24} style={{ color: "#ff2244" }} />
        <h1 className="text-2xl font-black text-white">Saved Maps</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#ff2244", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: "#7777aa" }}>{error}</p>
        </div>
      )}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="text-center py-20">
          <Bookmark size={48} className="mx-auto mb-4" style={{ color: "#7777aa" }} />
          <p className="text-lg font-bold text-white mb-2">No saved maps yet</p>
          <p className="text-sm" style={{ color: "#7777aa" }}>
            Click the bookmark icon on any map to save it for later.
          </p>
        </div>
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bookmarks.map((b) => (
            <MapCard key={b.id} map={b.map} />
          ))}
        </div>
      )}
    </div>
  );
}
