// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  ArrowRight,
  Download,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Clock,
  Activity,
  FileText,
  Globe,
  Building2,
  MapPin,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface AuditItem {
  id: string;
  url: string;
  status: string;
  progress: number;
  currentStep: string;
  overallScore: number | null;
  client: { name: string; domain?: string; businessType?: string; city?: string };
  createdAt: string;
}

const PIPELINE_STEPS = [
  { step: 1, label: 'Step 1: Fetch + Cheerio', threshold: 15 },
  { step: 2, label: 'Step 2: PageSpeed API', threshold: 30 },
  { step: 3, label: 'Step 3: Search Console', threshold: 45 },
  { step: 4, label: 'Step 4: Schema.org', threshold: 60 },
  { step: 5, label: 'Step 5: On-Page SEO', threshold: 70 },
  { step: 6, label: 'Step 6: robots & sitemap', threshold: 80 },
  { step: 7, label: 'Step 7: DataForSEO', threshold: 85 },
  { step: 8, label: 'Claude Sonnet 4.6', threshold: 90 },
  { step: 9, label: 'Puppeteer PDF & WhatsApp', threshold: 100 },
];

export default function AdminPortal() {
  const [clients, setClients] = useState<any[]>([]);
  const [triggerMode, setTriggerMode] = useState<'preset' | 'custom'>('preset');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [overrideUrl, setOverrideUrl] = useState('');

  // Custom client / URL fields
  const [customClientName, setCustomClientName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('Dental Clinic');
  const [customCity, setCustomCity] = useState('Pune');
  const [customState, setCustomState] = useState('Maharashtra');

  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [activeAudit, setActiveAudit] = useState<AuditItem | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingQueued, setIsProcessingQueued] = useState(false);

  // Load clients and recent audits
  const loadInitialData = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data.clients || []);
      if (data.clients?.length > 0 && !selectedClientId) {
        setSelectedClientId(data.clients[0].id);
      }
      setRecentAudits(data.recentAudits || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
    const tableInterval = setInterval(loadInitialData, 4000);
    return () => clearInterval(tableInterval);
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
    }, 900);

    return () => clearInterval(interval);
  }, [activeAuditId]);

  const handleTriggerAudit = async () => {
    if (triggerMode === 'preset' && !selectedClientId) return;
    if (triggerMode === 'custom' && !customDomain.trim()) return;

    setIsSubmitting(true);
    try {
      const payload =
        triggerMode === 'preset'
          ? {
              clientId: selectedClientId,
              url: overrideUrl.trim() || undefined,
            }
          : {
              customClientName: customClientName.trim() || customDomain.trim(),
              customDomain: customDomain.trim(),
              businessType: customBusinessType,
              city: customCity.trim() || 'Pune',
              state: customState.trim() || 'Maharashtra',
            };

      const res = await fetch('/api/audits/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.auditId) {
        setActiveAuditId(data.auditId);
        setActiveAudit({
          id: data.auditId,
          url: overrideUrl || customDomain || '',
          status: 'QUEUED',
          progress: 5,
          currentStep: 'Queued in BullMQ (seo-audit-jobs)',
          overallScore: null,
          client: { name: 'Starting Pipeline...' },
          createdAt: new Date().toISOString(),
        });
        loadInitialData();
      }
    } catch (err) {
      console.error('Trigger failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessAllQueued = async () => {
    setIsProcessingQueued(true);
    try {
      const res = await fetch('/api/audits/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processAllQueued: true }),
      });
      const data = await res.json();
      if (data.auditId) {
        setActiveAuditId(data.auditId);
      }
      setTimeout(loadInitialData, 1000);
    } catch (err) {
      console.error('Failed processing queued audits:', err);
    } finally {
      setIsProcessingQueued(false);
    }
  };

  const queuedCount = recentAudits.filter((a) => a.status === 'QUEUED').length;
  const completedAudits = recentAudits.filter((a) => a.status === 'COMPLETED');
  const avgScore =
    completedAudits.length > 0
      ? Math.round(
          completedAudits.reduce((acc, a) => acc + (a.overallScore || 0), 0) / completedAudits.length
        )
      : 68;

  const selectedClientObj = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-lg">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold text-teal-900">Edgelink Admin Portal</h1>
            <p className="text-xs text-slate-500">BullMQ Queue Manager &amp; 7-Step SEO Pipeline Controller</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Queue Worker Active
          </span>
          <Link
            href="/client"
            className="text-sm font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
          >
            Switch to Client Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Top KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Registered Clients</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{clients.length}</div>
            <div className="text-xs text-teal-600 mt-1 font-medium">Dental, Healthcare &amp; Realty</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Completed Audits</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{completedAudits.length}</div>
            <div className="text-xs text-slate-500 mt-1">Stored in Neon Postgres</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Avg SEO Score</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{avgScore}/100</div>
            <div className="text-xs text-slate-500 mt-1">Claude Sonnet 4.6 Engine</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-xs font-bold uppercase text-slate-400">Queue Status</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-amber-600">{queuedCount} Queued</span>
              {queuedCount > 0 && (
                <button
                  onClick={handleProcessAllQueued}
                  disabled={isProcessingQueued}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw size={12} className={isProcessingQueued ? 'animate-spin' : ''} />
                  Run All ({queuedCount})
                </button>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">BullMQ: seo-audit-jobs</div>
          </div>
        </div>

        {/* Interactive Visual Analytics Row: Client SEO Score Comparison Bar Chart & Pipeline Status Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Bar Chart: Client Audit Scores */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Client SEO Health Score Benchmark</h3>
                  <p className="text-xs text-slate-500">Click any bar to inspect the full interactive Client Dashboard</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                Live Bar Graph
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-end h-44 pt-6 px-2 border-b border-slate-100">
              {(completedAudits.length > 0
                ? completedAudits.slice(0, 5)
                : [
                    { id: 'demo-1', overallScore: 68, client: { name: 'Pune Smile Dental' } },
                    { id: 'demo-2', overallScore: 74, client: { name: 'Pune Premier Realty' } },
                    { id: 'demo-3', overallScore: 64, client: { name: 'Sahyadri Healthcare' } },
                    { id: 'demo-4', overallScore: 79, client: { name: 'Mumbai Apex Dental' } },
                    { id: 'demo-5', overallScore: 61, client: { name: 'Bangalore Skyline' } },
                  ]
              ).map((item, idx) => {
                const scoreVal = item.overallScore || 64;
                const barHeight = Math.max(20, scoreVal);
                const barColor =
                  scoreVal >= 75
                    ? 'from-emerald-500 to-teal-600'
                    : scoreVal >= 65
                    ? 'from-teal-500 to-teal-700'
                    : 'from-amber-400 to-orange-500';
                return (
                  <Link
                    key={item.id + idx}
                    href={item.id.startsWith('demo') ? '/client' : `/client/${item.id}`}
                    className="flex flex-col items-center group cursor-pointer h-full justify-end"
                  >
                    <span className="text-xs font-black text-slate-700 group-hover:text-teal-700 mb-1 transition">
                      {scoreVal}%
                    </span>
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg h-28 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t ${barColor} group-hover:opacity-90 transition-all duration-700`}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 mt-2 truncate max-w-[100px] text-center">
                      {item.client?.name?.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pipeline Job Distribution Donut Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <PieChart size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">BullMQ Job Distribution</h3>
                <p className="text-xs text-slate-500">Queue execution health</p>
              </div>
            </div>

            {(() => {
              const totalJobs = Math.max(1, recentAudits.length);
              const compPct = Math.round((completedAudits.length / totalJobs) * 100);
              const radius = 48;
              const circ = 2 * Math.PI * radius;
              const compDash = (completedAudits.length / totalJobs) * circ;

              return (
                <div className="flex items-center gap-5 my-auto py-2">
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#fef3c7" strokeWidth="16" />
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="16"
                        strokeDasharray={`${compDash} ${circ}`}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-800">{compPct}%</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Success</span>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                      <strong className="text-emerald-950">{completedAudits.length}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                      <span className="flex items-center gap-1.5 font-semibold text-amber-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Queued
                      </span>
                      <strong className="text-amber-950">{queuedCount}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-600">Total Runs</span>
                      <strong className="text-slate-900">{recentAudits.length}</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Trigger Audit Card with Preset & Custom Options */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Trigger New SEO Audit Pipeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Runs 7-step crawler &rarr; Claude Sonnet 4.6 JSON analysis &rarr; Postgres DB &rarr; Puppeteer PDF &rarr; Twilio WhatsApp Mock
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setTriggerMode('preset')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  triggerMode === 'preset'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Select Registered Client ({clients.length})
              </button>
              <button
                type="button"
                onClick={() => setTriggerMode('custom')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  triggerMode === 'custom'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle size={13} /> Audit Custom URL / New Client
              </button>
            </div>
          </div>

          {triggerMode === 'preset' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Select Client Target:
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setOverrideUrl('');
                    }}
                    className="w-full border border-slate-300 bg-white rounded-lg px-4 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.domain} ({c.businessType}, {c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Target URL Override (Optional):
                  </label>
                  <input
                    type="text"
                    value={overrideUrl}
                    onChange={(e) => setOverrideUrl(e.target.value)}
                    placeholder={selectedClientObj?.domain || 'https://example-dental-clinic.com'}
                    className="w-full border border-slate-300 bg-white rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400">Quick Select:</span>
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setOverrideUrl('');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      selectedClientId === c.id
                        ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.name.split(' ')[0]} {c.name.split(' ')[1]} ({c.businessType})
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Website URL to Audit *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="https://my-dental-clinic-pune.com"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  placeholder="e.g. City Care Dental"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sector / Business Type
                </label>
                <select
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Dental Clinic">Dental Clinic</option>
                  <option value="Healthcare Clinic">Healthcare / Hospital</option>
                  <option value="Real Estate Agency">Real Estate</option>
                  <option value="Local Business">Indian Local Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Pune"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              💡 <strong>Pipeline Execution:</strong> Automatically queues in BullMQ (<code>seo-audit-jobs</code>) and streams real-time progress across all 7 crawler steps &amp; PDF generation.
            </div>
            <button
              onClick={handleTriggerAudit}
              disabled={isSubmitting || (triggerMode === 'custom' && !customDomain.trim())}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm cursor-pointer shrink-0"
            >
              <Play size={16} />
              {isSubmitting ? 'Starting Pipeline...' : 'Run Full Audit Pipeline'}
            </button>
          </div>
        </div>

        {/* Live Progress Card (Shown during active audit) */}
        {activeAudit && (
          <div className="bg-teal-950 text-white p-6 rounded-xl shadow-lg space-y-5 border border-teal-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
                  <Activity size={14} className="animate-spin" />
                  BullMQ Pipeline Active ({activeAudit.status})
                </span>
                <h3 className="text-lg font-bold mt-1">{activeAudit.currentStep}</h3>
              </div>
              <span className="text-3xl font-black text-teal-300">{activeAudit.progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-teal-900 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${activeAudit.progress}%` }}
              />
            </div>

            {/* 9-Step Visual Checklist */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 pt-1">
              {PIPELINE_STEPS.map((s) => {
                const done = activeAudit.progress >= s.threshold;
                return (
                  <div
                    key={s.step}
                    className={`p-2 rounded-lg text-[11px] font-medium border transition ${
                      done
                        ? 'bg-teal-900/90 border-teal-500 text-teal-200'
                        : 'bg-teal-950/50 border-teal-900 text-teal-600'
                    }`}
                  >
                    <div className="font-bold">{done ? '✓ ' : ''}{s.label}</div>
                  </div>
                );
              })}
            </div>

            {activeAudit.status === 'COMPLETED' && (
              <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-teal-800">
                <span className="text-sm text-teal-200">
                  ✅ Audit finished with score: <strong className="text-white">{activeAudit.overallScore}/100</strong> — Saved to Postgres &amp; PDF Generated!
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={`/api/reports/${activeAudit.id}`}
                    download
                    className="bg-white hover:bg-slate-100 text-teal-950 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download size={13} /> Download PDF
                  </a>
                  <Link
                    href={`/client/${activeAudit.id}`}
                    className="bg-teal-400 hover:bg-teal-300 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    View Client Report <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audits History */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-800">Recent Audit Pipeline Runs</span>
            {queuedCount > 0 && (
              <button
                onClick={handleProcessAllQueued}
                disabled={isProcessingQueued}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} className={isProcessingQueued ? 'animate-spin' : ''} />
                Process {queuedCount} Queued Job(s) Now
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Client &amp; Domain</th>
                  <th className="px-6 py-3">Status &amp; Step</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAudits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{a.client?.name}</div>
                      <div className="text-xs text-slate-400">{a.url}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          a.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'RUNNING'
                            ? 'bg-amber-100 text-amber-800'
                            : a.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {a.status} {a.status === 'RUNNING' ? `(${a.progress}%)` : ''}
                      </span>
                      {a.currentStep && (
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                          {a.currentStep}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {a.overallScore ? `${a.overallScore}/100` : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(a.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={`/api/reports/${a.id}`}
                          download
                          className="text-slate-600 hover:text-teal-700 font-medium text-xs flex items-center gap-1 border border-slate-200 px-2.5 py-1 rounded-md hover:border-teal-300 transition"
                        >
                          <Download size={12} /> PDF
                        </a>
                        <Link
                          href={`/client/${a.id}`}
                          className="text-teal-600 hover:text-teal-800 font-semibold text-xs flex items-center gap-1"
                        >
                          View Report <ArrowRight size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
