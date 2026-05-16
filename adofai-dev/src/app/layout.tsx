import type { Metadata } from "next";
import DevNav from "@/components/DevNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ADOFAI Developer Hub — dev.adofai.net",
    template: "%s · ADOFAI Dev",
  },
  description:
    "Developer documentation for the ADOFAI.NET OAuth stack: IdP endpoints, environment split, OAuth 2.0 + PKCE integration guide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DevNav />
        {children}
        <footer className="foot">
          ADOFAI developer docs — community infrastructure, not affiliated with publishers.
          <br />
          <a href="https://github.com/3289david/adofai-dev">Source (adofai-dev)</a>
          {" · "}
          <a href="https://github.com/3289david/adofai-oauth">IdP source (adofai-oauth)</a>
          {" · "}
          <a href="https://auth.adofai.net/how-it-works">Player docs</a>
        </footer>
      </body>
    </html>
  );
}
