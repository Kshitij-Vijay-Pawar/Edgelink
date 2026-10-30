import Link from 'next/link';
import { ArrowRight, Activity, ShieldCheck, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-slate-800 px-8 py-5 flex justify-between items-center max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
            E
          </div>
          <span className="font-bold text-lg tracking-tight">Edgelink SEO Platform</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-slate-300 hover:text-white transition">
            Admin Portal
          </Link>
          <Link
            href="/client"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium px-4 py-2 rounded-lg transition"
          >
            Client Report
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Autonomous SEO Auditing Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          AI-Powered Full Stack <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            SEO Intelligence & Automation
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mb-10">
          Harvest multi-source signals across 7 crawlers, execute deep LLM audits with Claude 3.5 Sonnet, stream real-time progress via BullMQ, and dispatch executive PDF reports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/admin"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20"
          >
            Launch Admin Portal <ArrowRight size={18} />
          </Link>
          <Link
            href="/client"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            View Sample Client Report
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
              <Cpu size={20} />
            </div>
            <h3 className="font-semibold text-white mb-1">BullMQ Worker Engine</h3>
            <p className="text-sm text-slate-400">
              Decoupled queue-based background orchestration on Redis for resilient concurrency.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
              <Activity size={20} />
            </div>
            <h3 className="font-semibold text-white mb-1">7 Headless Crawlers</h3>
            <p className="text-sm text-slate-400">
              Aggregates Cheerio, PageSpeed, GSC, Schema.org, On-Page, robots.txt, and DataForSEO signals.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-white mb-1">Claude 3.5 Sonnet</h3>
            <p className="text-sm text-slate-400">
              Evaluates structured technical SEO health with actionable prioritized remediation guides.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Edgelink Technology &copy; 2026 SEO Automation Engine. All rights reserved.
      </footer>
    </div>
  );
}
