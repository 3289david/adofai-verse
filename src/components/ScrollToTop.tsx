"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: "rgba(16,16,30,0.7)",
        border: "1px solid rgba(26,26,53,0.8)",
        color: "#f0f0ff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,34,68,0.25)";
        e.currentTarget.style.borderColor = "#ff2244";
        e.currentTarget.style.color = "#ff2244";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(16,16,30,0.7)";
        e.currentTarget.style.borderColor = "rgba(26,26,53,0.8)";
        e.currentTarget.style.color = "#f0f0ff";
      }}
    >
      <ArrowUp size={18} />
    </button>
  );
}
