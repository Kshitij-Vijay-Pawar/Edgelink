// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';

interface AuditItem {
  id: string;
  url: string;
  status: string;
  progress: number;
  currentStep: string;
  overallScore: number | null;
  client: { name: string };
  createdAt: string;
}

export default function AdminPortal() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [activeAudit, setActiveAudit] = useState<AuditItem | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load clients and recent audits
  const loadInitialData = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data.clients || []);
      if (data.clients?.length > 0) setSelectedClientId(data.clients[0].id);
      setRecentAudits(data.recentAudits || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Poll active audit for real-time progress updates
  useEffect(() => {
    if (!activeAuditId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/audits/${activeAuditId}`);
      if (res.ok) {
        const { audit } = await res.json();
        setActiveAudit(audit);
        if (audit.status === 'COMPLETED' || audit.status === 'FAILED') {
          clearInterval(interval);
          loadInitialData();
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeAuditId]);

  const handleTriggerAudit = async () => {
    if (!selectedClientId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/audits/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClientId }),
      });
      const data = await res.json();
      if (data.auditId) {
        setActiveAuditId(data.auditId);
        setActiveAudit({
          id: data.auditId,
          url: '',
          status: 'QUEUED',
          progress: 5,
          currentStep: 'Queued in BullMQ',
          overallScore: null,
          client: { name: 'Processing...' },
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Trigger failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-teal-800">Edgelink Admin Portal</h1>
          <p className="text-xs text-slate-500">BullMQ Queue Manager & SEO Pipeline Controller</p>
        </div>
        <Link href="/client" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
          Switch to Client Dashboard <ArrowRight size={14} />
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Trigger Audit Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Trigger New SEO Audit</h2>
          <p className="text-sm text-slate-600 mb-4">
            Dispatches a full crawl job to BullMQ queue: <code>seo-audit-jobs</code>.
          </p>

          <div className="flex gap-4 items-center">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 text-sm flex-1 max-w-md focus:ring-2 focus:ring-teal-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.domain})
                </option>
              ))}
            </select>

            <button
              onClick={handleTriggerAudit}
              disabled={isSubmitting}
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-6 py-2 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <Play size={16} /> Run Full Audit Pipeline
            </button>
          </div>
        </div>

        {/* Live Progress Card (Shown during active audit) */}
        {activeAudit && (
          <div className="bg-teal-900 text-white p-6 rounded-xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                  BullMQ Job Active ({activeAudit.status})
                </span>
                <h3 className="text-lg font-bold">{activeAudit.currentStep}</h3>
              </div>
              <span className="text-2xl font-black">{activeAudit.progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-teal-950 rounded-full h-3 overflow-hidden">
              <div
                className="bg-teal-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${activeAudit.progress}%` }}
              />
            </div>

            {activeAudit.status === 'COMPLETED' && (
              <div className="flex justify-between items-center pt-2 border-t border-teal-800">
                <span className="text-sm text-teal-200">
                  Audit finished with score: <strong>{activeAudit.overallScore}/100</strong>
                </span>
                <a
                  href={`/client/${activeAudit.id}`}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold"
                >
                  View Client Report
                </a>
              </div>
            )}
          </div>
        )}

        {/* Audits History */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 font-semibold text-slate-800">
            Recent Audit Pipeline Runs
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAudits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{a.client?.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        a.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'RUNNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{a.overallScore ? `${a.overallScore}/100` : '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(a.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/client/${a.id}`}
                      className="text-teal-600 hover:text-teal-800 font-medium text-xs flex items-center gap-1"
                    >
                      View Report <ArrowRight size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
