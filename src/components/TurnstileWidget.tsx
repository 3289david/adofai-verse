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
    _turnstileOnLoad?: () => void;
    _turnstileReady?: boolean;
    _turnstileQueue?: (() => void)[];
  }
}

export function TurnstileWidget({ onToken, onError, onExpire, className = "" }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | null>(null);

  const onTokenRef  = useRef(onToken);
  const onErrorRef  = useRef(onError);
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onTokenRef.current  = onToken;  }, [onToken]);
  useEffect(() => { onErrorRef.current  = onError;  }, [onError]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      onTokenRef.current("dev-bypass-token");
      return;
    }

    function renderWidget() {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey!,
        theme:   "dark",
        size:    "normal",
        callback:           (token) => onTokenRef.current(token),
        "error-callback":   ()      => onErrorRef.current?.(),
        "expired-callback": ()      => {
          widgetIdRef.current = null;
          onExpireRef.current?.();
        },
      });
    }

    if (window._turnstileReady && window.turnstile) {
      renderWidget();
    } else {
      if (!window._turnstileQueue) window._turnstileQueue = [];
      window._turnstileQueue.push(renderWidget);

      const SCRIPT_ID = "cf-turnstile-script";
      if (!document.getElementById(SCRIPT_ID)) {
        window._turnstileOnLoad = () => {
          window._turnstileReady = true;
          window._turnstileQueue?.forEach(fn => fn());
          window._turnstileQueue = [];
        };
        const s = document.createElement("script");
        s.id    = SCRIPT_ID;
        s.src   = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=_turnstileOnLoad";
        s.async = true;
        document.head.appendChild(s);
      }
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
      aria-label="Human verification"
    />
  );
}
