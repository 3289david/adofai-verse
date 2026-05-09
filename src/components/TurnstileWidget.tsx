"use client";

import { useEffect, useRef, useCallback } from "react";

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
        el: HTMLElement | string,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
          language?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export function TurnstileWidget({ onToken, onError, onExpire, className = "" }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return; // already rendered

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      size: "normal",
      callback: onToken,
      "error-callback": onError,
      "expired-callback": onExpire ?? (() => {
        widgetIdRef.current = null;
      }),
    });
  }, [siteKey, onToken, onError, onExpire]);

  useEffect(() => {
    if (!siteKey) {
      // Dev/test mode: bypass with dummy token after a short delay
      const t = setTimeout(() => onToken("dev-bypass-token"), 300);
      return () => clearTimeout(t);
    }

    // Load Turnstile script once
    const SCRIPT_ID = "cf-turnstile-script";
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Callback set on window for the onload param
    window.onTurnstileLoad = renderWidget;

    // If already loaded
    if (window.turnstile) renderWidget();

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget]);

  if (!siteKey && process.env.NODE_ENV === "production") return null;

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
      aria-label="Human verification challenge"
    />
  );
}
