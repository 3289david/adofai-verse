import Link from "next/link";
import { Shield, Mail, AlertTriangle, FileText, CheckCircle, Flag } from "lucide-react";

export const metadata = {
  title: "DMCA & Copyright Policy — ADOFAI.NET",
  description:
    "Copyright and DMCA takedown policy for ADOFAI.NET. Learn how to report copyright issues and request content removal.",
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,34,68,0.12)", border: "1px solid rgba(255,34,68,0.25)" }}>
            <Shield size={20} style={{ color: "#ff2244" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">DMCA &amp; Copyright Policy</h1>
            <p className="text-xs text-soft mt-0.5">Last updated: May 2026</p>
          </div>
        </div>
        <p className="text-sm text-soft leading-relaxed">
          ADOFAI.NET respects intellectual property rights and takes copyright infringement seriously.
          This page explains how to report infringing content and what happens after a report is filed.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div className="mb-8 p-4 rounded-xl flex gap-3" style={{ background: "rgba(255,34,68,0.06)", border: "1px solid rgba(255,34,68,0.2)" }}>
        <AlertTriangle size={16} style={{ color: "#ff2244" }} className="flex-shrink-0 mt-0.5" />
        <div className="text-xs text-soft leading-relaxed">
          <p className="font-bold text-white mb-1">Trademark Notice</p>
          <p>
            <em>ADOFAI</em> and <em>A Dance of Fire and Ice</em> are trademarks of{" "}
            <strong className="text-white">7th Beat Games</strong>. ADOFAI.NET is an independent fan
            community site and is <strong className="text-white">not affiliated with, endorsed by, or
            sponsored by 7th Beat Games</strong> in any way.
          </p>
        </div>
      </div>

      {/* Section: What we host */}
      <section className="mb-8">
        <h2 className="text-base font-black text-white mb-3 flex items-center gap-2">
          <FileText size={15} style={{ color: "#0077ff" }} />
          What ADOFAI.NET Hosts
        </h2>
        <div className="p-4 bg-card border border-line rounded-xl text-xs text-soft leading-relaxed space-y-2">
          <p>
            ADOFAI.NET is a fan-created community platform. We store:
          </p>
          <ul className="list-disc ml-4 space-y-1">
            <li><strong className="text-white">Map metadata only</strong> — title, artist, difficulty, BPM, tile count.</li>
            <li><strong className="text-white">Links to Steam Workshop</strong> — we do not host or distribute
              map files (.adofai). All download links point directly to Steam Workshop pages operated by Valve.</li>
            <li><strong className="text-white">User-provided cover images</strong> — uploaded by community members.</li>
            <li><strong className="text-white">Community records and comments</strong> — user-submitted gameplay data.</li>
          </ul>
          <p className="mt-2">
            We do <strong className="text-white">not</strong> host, distribute, or reproduce copyrighted
            music, game assets, or level files directly.
          </p>
        </div>
      </section>

      {/* Section: Report copyright */}
      <section className="mb-8">
        <h2 className="text-base font-black text-white mb-3 flex items-center gap-2">
          <Mail size={15} style={{ color: "#ff2244" }} />
          How to File a Copyright / DMCA Takedown Request
        </h2>
        <div className="p-4 bg-card border border-line rounded-xl text-xs text-soft leading-relaxed space-y-3">
          <p>
            If you are a copyright owner (or authorized agent) and believe that content on ADOFAI.NET
            infringes your copyright, please send a written notice to:
          </p>
          <div className="p-3 rounded-lg text-center" style={{ background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.2)" }}>
            <a
              href="mailto:legal@adofai.net?subject=DMCA%20Takedown%20Request"
              className="text-sm font-bold hover:underline"
              style={{ color: "#ff2244" }}
            >
              legal@adofai.net
            </a>
            <p className="text-dim mt-1">Subject: DMCA Takedown Request</p>
          </div>

          <p className="font-bold text-white mt-2">Your notice must include:</p>
          <ol className="list-decimal ml-4 space-y-1.5">
            <li>Your full legal name and contact information (email, address, phone).</li>
            <li>Identification of the copyrighted work you claim is being infringed.</li>
            <li>The specific URL(s) on ADOFAI.NET where the infringing content appears.</li>
            <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement, made under penalty of perjury, that you are the copyright owner or authorized to act on their behalf.</li>
            <li>Your electronic or physical signature.</li>
          </ol>

          <p className="mt-2 text-dim">
            We will respond to valid DMCA notices within <strong className="text-white">72 hours</strong>{" "}
            and remove or disable access to the reported content pending investigation.
          </p>
        </div>
      </section>

      {/* Section: Report button */}
      <section className="mb-8">
        <h2 className="text-base font-black text-white mb-3 flex items-center gap-2">
          <Flag size={15} style={{ color: "#cc44ff" }} />
          Report a Specific Map
        </h2>
        <div className="p-4 bg-card border border-line rounded-xl text-xs text-soft leading-relaxed space-y-3">
          <p>
            To report a specific map on ADOFAI.NET for a copyright issue, you can:
          </p>
          <ul className="list-disc ml-4 space-y-1.5">
            <li>
              Click the <strong className="text-white">"Report"</strong> button on any map detail page.
              This opens a pre-filled email to our legal team with the map ID included.
            </li>
            <li>
              Email <a href="mailto:legal@adofai.net" className="text-fire hover:underline">legal@adofai.net</a>{" "}
              directly with the map URL and a description of the issue.
            </li>
          </ul>
          <div className="flex gap-2 mt-3">
            <a
              href="mailto:legal@adofai.net?subject=Map%20Copyright%20Report&body=Map%20URL%3A%20%0A%0AReason%3A%20"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors"
              style={{ background: "linear-gradient(135deg,#ff2244,#ff8800)" }}
            >
              <Mail size={12} />Email Legal Team
            </a>
            <Link
              href="/maps"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-line text-soft hover:border-line-hi hover:text-white transition-colors"
            >
              Browse Maps
            </Link>
          </div>
        </div>
      </section>

      {/* Section: Upload policy */}
      <section className="mb-8">
        <h2 className="text-base font-black text-white mb-3 flex items-center gap-2">
          <CheckCircle size={15} style={{ color: "#44dd88" }} />
          Upload Terms &amp; Responsibilities
        </h2>
        <div className="p-4 bg-card border border-line rounded-xl text-xs text-soft leading-relaxed space-y-2">
          <p>
            When you upload a map to ADOFAI.NET, you agree that:
          </p>
          <ul className="list-disc ml-4 space-y-1.5">
            <li>You are the creator of the level, or you have explicit permission from the creator to share it.</li>
            <li>The music used in the level is either licensed for use, used with permission, or qualifies as fair use under applicable law.</li>
            <li>You will not upload content that infringes on the copyright, trademark, or other intellectual property rights of any third party.</li>
            <li>You understand that ADOFAI.NET may remove your submission at any time in response to a valid copyright claim or at our discretion.</li>
            <li>You will provide a Steam Workshop link as the download source — ADOFAI.NET does not host map files directly.</li>
          </ul>
          <p className="mt-2">
            Repeat infringers may have their accounts suspended or terminated.
          </p>
        </div>
      </section>

      {/* Section: Counter-notice */}
      <section className="mb-8">
        <h2 className="text-base font-black text-white mb-3">Counter-Notice</h2>
        <div className="p-4 bg-card border border-line rounded-xl text-xs text-soft leading-relaxed space-y-2">
          <p>
            If you believe your content was removed in error, you may submit a counter-notice to{" "}
            <a href="mailto:legal@adofai.net" className="text-fire hover:underline">legal@adofai.net</a>{" "}
            with the subject line <em>"DMCA Counter-Notice"</em>. Your counter-notice must include:
          </p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Your full name and contact information.</li>
            <li>Identification of the content that was removed and the URL where it appeared.</li>
            <li>A statement under penalty of perjury that you have a good-faith belief the content was removed as a result of mistake or misidentification.</li>
            <li>Your consent to the jurisdiction of the federal district court for your location.</li>
            <li>Your electronic or physical signature.</li>
          </ol>
        </div>
      </section>

      {/* Contact block */}
      <div className="p-5 rounded-xl" style={{ background: "rgba(16,16,30,0.8)", border: "1px solid rgba(26,26,53,0.8)" }}>
        <p className="text-xs font-bold text-white mb-3">Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-soft">
          <div>
            <p className="text-dim mb-1">Legal &amp; DMCA</p>
            <a href="mailto:legal@adofai.net" className="text-fire hover:underline">legal@adofai.net</a>
          </div>
          <div>
            <p className="text-dim mb-1">General</p>
            <a href="mailto:contact@adofai.net" className="hover:text-white transition-colors">contact@adofai.net</a>
          </div>
          <div>
            <p className="text-dim mb-1">Support</p>
            <a href="mailto:help@adofai.net" className="hover:text-white transition-colors">help@adofai.net</a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs text-dim">
        <Link href="/terms" className="hover:text-soft transition-colors">Terms of Service</Link>
        <Link href="/privacy" className="hover:text-soft transition-colors">Privacy Policy</Link>
        <Link href="/about" className="hover:text-soft transition-colors">About</Link>
      </div>
    </div>
  );
}
