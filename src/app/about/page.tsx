import Link from "next/link";
import { Github, Mail, Shield, Code2, Brain, BarChart2, Music, Trophy, Upload } from "lucide-react";

export const metadata = { title: "About — ADOFAI.NET" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          About <span className="fire-text">ADOFAI</span>.NET
        </h1>
        <p className="text-soft text-lg max-w-xl mx-auto">
          The open-source community platform for A Dance of Fire and Ice players worldwide.
        </p>
      </div>

      {/* What is ADOFAI.NET */}
      <div className="bg-card border border-line rounded-xl p-8 mb-6">
        <h2 className="text-lg font-black text-white mb-4">What is ADOFAI.NET?</h2>
        <p className="text-soft text-sm leading-relaxed mb-4">
          ADOFAI.NET is a free, community-driven platform built for A Dance of Fire and Ice enthusiasts.
          We aggregate maps from Steam Workshop and adofai.gg, provide global rankings based on player records,
          and offer unique tools like .adofai file analysis and AI-powered coaching.
        </p>
        <p className="text-soft text-sm leading-relaxed">
          The platform is fully open source and not affiliated with or endorsed by 7th Beat Games.
          Built with Next.js, PostgreSQL, and Pollinations AI.
        </p>
      </div>

      {/* Features grid */}
      <h2 className="text-lg font-black text-white mb-4">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Music,     color: "#ff8800", title: "Map Database",      desc: "Browse thousands of community maps from Steam Workshop and adofai.gg with advanced filtering." },
          { icon: Trophy,    color: "#ffd700", title: "Global Rankings",   desc: "Compete with players worldwide. Track XP, accuracy, and cleared maps on the global leaderboard." },
          { icon: BarChart2, color: "#0077ff", title: "File Analyzer",     desc: "Upload .adofai files for detailed BPM timeline analysis, pattern detection, and section breakdowns." },
          { icon: Brain,     color: "#cc44ff", title: "AI Coach",          desc: "Get personalized tips and difficulty breakdowns from our free AI coaching system." },
          { icon: Upload,    color: "#44dd88", title: "Map Uploads",       desc: "Share your own levels with the community. Supports file and folder uploads with auto-parsing." },
          { icon: Code2,     color: "#ffdd00", title: "Public API",        desc: "Build your own ADOFAI tools with our free REST API. No authentication required for public data." },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="bg-card border border-line rounded-xl p-5 hover:border-line-hi transition-colors">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
            <p className="text-xs text-soft leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Open Source */}
      <div className="bg-card border border-line rounded-xl p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Github size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white mb-2">Open Source</h2>
            <p className="text-soft text-sm leading-relaxed mb-4">
              ADOFAI.NET is fully open source. Contributions, bug reports, and feature requests are welcome.
            </p>
            <a href="https://github.com/3289david/adofai-verse" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
              <Github size={15} /> View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-card border border-line rounded-xl p-8">
        <h2 className="text-lg font-black text-white mb-4">Contact Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { email: "contact@adofai.net", label: "General Inquiries",      color: "#0077ff", desc: "Questions, partnerships, press" },
            { email: "help@adofai.net",    label: "Help & Support",          color: "#44dd88", desc: "Account issues, bug reports" },
            { email: "legal@adofai.net",   label: "Legal & Privacy",         color: "#ff8800", desc: "DMCA, data requests, legal" },
            { email: "dev@adofai.net",     label: "Developer & API",         color: "#cc44ff", desc: "API questions, integrations" },
          ].map(({ email, label, color, desc }) => (
            <a key={email} href={`mailto:${email}`}
              className="flex items-start gap-3 p-4 bg-page border border-line rounded-xl hover:border-line-hi transition-colors group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Mail size={14} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-fire transition-colors">{label}</p>
                <p className="text-xs text-soft mb-0.5">{desc}</p>
                <p className="text-xs font-mono" style={{ color }}>{email}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Legal links */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-soft">
        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/api-docs" className="hover:text-white transition-colors">API Documentation</Link>
      </div>
    </div>
  );
}
