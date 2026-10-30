// src/app/client/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';

export default function ClientDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedId, setResolvedId] = useState<string>('');
  const [audit, setAudit] = useState<any>(null);

  useEffect(() => {
    params.then((p) => {
      setResolvedId(p.id);
      fetch(`/api/audits/${p.id}`)
        .then((res) => res.json())
        .then((data) => setAudit(data.audit));
    });
  }, [params]);

  if (!audit) {
    return <div className="p-12 text-center text-slate-500">Loading Client SEO Report...</div>;
  }

  const breakdown = audit.scoreBreakdown || {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <header className="bg-white border-b px-8 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-xs uppercase font-bold text-teal-600 tracking-wider">Client SEO Intelligence</div>
            <h1 className="text-2xl font-bold text-slate-900">{audit.client?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{audit.url}</p>
          </div>

          <a
            href={`/api/reports/${audit.id}`}
            download
            className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition"
          >
            <Download size={16} /> Download Official PDF Report
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Score & Breakdown Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-6 bg-teal-50 rounded-2xl border border-teal-100 w-44 h-44">
            <span className="text-5xl font-black text-teal-800">{audit.overallScore || 0}</span>
            <span className="text-xs uppercase font-bold text-teal-600 tracking-wider mt-1">SEO Health Score</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 w-full">
            {[
              { name: 'Technical', val: breakdown.technical },
              { name: 'On-Page', val: breakdown.on_page },
              { name: 'Content', val: breakdown.content },
              { name: 'Core Web Vitals', val: breakdown.core_web_vitals },
              { name: 'Schema Markup', val: breakdown.schema },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center">
                <div className="text-2xl font-bold text-slate-800">{item.val ?? '—'}%</div>
                <div className="text-xs font-semibold text-slate-500 uppercase mt-1">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-lg">
          <h3 className="text-sm font-bold text-emerald-900 mb-1">Executive Summary</h3>
          <p className="text-sm text-emerald-800 leading-relaxed">{audit.executiveSummary}</p>
        </div>

        {/* Prioritized Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Prioritized Action Items</h2>
          <div className="space-y-4">
            {audit.recommendations?.map((rec: any) => (
              <div key={rec.id} className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : rec.priority === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">{rec.category}</span>
                  <span className="text-xs text-slate-400">• Effort: {rec.effort}</span>
                </div>
                <h4 className="font-semibold text-slate-800 text-base">{rec.finding}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  <strong>Fix:</strong> {rec.fix}
                </p>
                <div className="mt-3 text-xs bg-slate-50 text-slate-700 p-2.5 rounded-lg border border-slate-100 font-mono">
                  <strong>Verification (Falsifiability):</strong> {rec.falsifiabilityCheck}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
