"use client";

import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onToken, onError, onExpire, className = "" }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | null>(null);

  // Keep callback refs always current — avoids stale closure issues
  const onTokenRef  = useRef(onToken);
  const onErrorRef  = useRef(onError);
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onTokenRef.current  = onToken;  }, [onToken]);
  useEffect(() => { onErrorRef.current  = onError;  }, [onError]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // Dev / no key configured: bypass immediately
    if (!siteKey) {
      const t = setTimeout(() => onTokenRef.current("dev-bypass-token"), 100);
      return () => clearTimeout(t);
    }

    // Inject Turnstile script once (no ?onload= — we poll instead)
    const SCRIPT_ID = "cf-turnstile-script";
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id    = SCRIPT_ID;
      s.src   = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      document.head.appendChild(s);
    }

    // Poll until turnstile API is ready, then render once
    const interval = setInterval(() => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) { clearInterval(interval); return; }

      clearInterval(interval);
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme:   "dark",
        size:    "normal",
        callback:           (token) => onTokenRef.current(token),
        "error-callback":   ()      => onErrorRef.current?.(),
        "expired-callback": ()      => {
          widgetIdRef.current = null;
          onExpireRef.current?.();
        },
      });
    }, 150);

    return () => {
      clearInterval(interval);
      if (window.turnstile && widgetIdRef.current) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — callbacks are accessed via refs

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
      aria-label="Human verification"
    />
  );
}
