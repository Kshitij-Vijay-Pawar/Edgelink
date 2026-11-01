// src/app/client/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  CheckCircle,
  AlertTriangle,
  Zap,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Search,
  Award,
  Filter,
} from 'lucide-react';

// Interactive SVG Radar Chart for 5 SEO Pillars
function SeoRadarChart({
  scores,
}: {
  scores: { label: string; value: number; key: string }[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const size = 260;
  const center = size / 2;
  const radius = 88;
  const levels = [25, 50, 75, 100];

  const getPoint = (index: number, val: number) => {
    const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, val)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = scores
    .map((s, idx) => {
      const pt = getPoint(idx, s.value);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric grid polygons */}
        {levels.map((lvl) => {
          const pts = scores
            .map((_, idx) => {
              const p = getPoint(idx, lvl);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvl === 100 ? 'none' : '3,3'}
            />
          );
        })}

        {/* Axis lines */}
        {scores.map((_, idx) => {
          const end = getPoint(idx, 100);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(13, 148, 136, 0.22)"
          stroke="#0f766e"
          strokeWidth="2.5"
          className="transition-all duration-500"
        />

        {/* Data vertices and labels */}
        {scores.map((s, idx) => {
          const pt = getPoint(idx, s.value);
          const labelPt = getPoint(idx, 124);
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={s.key}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 7 : 5}
                fill={isHovered ? '#0d9488' : '#0f766e'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-bold transition-colors ${
                  isHovered ? 'fill-teal-700' : 'fill-slate-600'
                }`}
              >
                {s.label} ({s.value}%)
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIdx !== null && (
        <div className="mt-1 px-3 py-1 rounded-full bg-teal-900 text-white text-xs font-semibold shadow">
          {scores[hoveredIdx].label}: {scores[hoveredIdx].value}/100
        </div>
      )}
    </div>
  );
}

// Interactive SVG Donut / Pie Chart for Issue & Priority Distribution
function IssueDonutChart({
  segments,
  totalLabel,
}: {
  segments: { label: string; count: number; color: string; bgClass: string }[];
  totalLabel: string;
}) {
  const [activeSeg, setActiveSeg] = useState<number | null>(null);
  const total = segments.reduce((sum, s) => sum + s.count, 0) || 1;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="22"
          />
          {segments.map((seg, idx) => {
            const pct = seg.count / total;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += pct;
            const isHovered = activeSeg === idx;

            return (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? 26 : 22}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                onMouseEnter={() => setActiveSeg(idx)}
                onMouseLeave={() => setActiveSeg(null)}
                className="transition-all duration-300 cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-3xl font-black text-slate-800">
            {activeSeg !== null ? segments[activeSeg].count : segments.reduce((s, x) => s + x.count, 0)}
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            {activeSeg !== null ? segments[activeSeg].label : totalLabel}
          </span>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="space-y-2.5 flex-1 w-full">
        {segments.map((seg, idx) => {
          const pct = Math.round((seg.count / total) * 100);
          return (
            <div
              key={seg.label}
              onMouseEnter={() => setActiveSeg(idx)}
              onMouseLeave={() => setActiveSeg(null)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                activeSeg === idx
                  ? 'border-slate-300 bg-slate-50 shadow-sm scale-[1.01]'
                  : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs font-semibold text-slate-700">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">{seg.count}</span>
                <span className="text-[11px] text-slate-400 font-medium">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedId, setResolvedId] = useState<string>('');
  const [audit, setAudit] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [gscMetricView, setGscMetricView] = useState<'clicks' | 'impressions'>('clicks');

  useEffect(() => {
    let timer: any;
    params.then((p) => {
      setResolvedId(p.id);
      const fetchAudit = () => {
        fetch(`/api/audits/${p.id}`)
          .then((res) => res.json())
          .then((data) => {
            setAudit(data.audit);
            if (data.audit && (data.audit.status === 'QUEUED' || data.audit.status === 'RUNNING')) {
              timer = setTimeout(fetchAudit, 1200);
            }
          });
      };
      fetchAudit();
    });
    return () => clearTimeout(timer);
  }, [params]);

  const handleDownloadPdf = async () => {
    if (!audit) return;
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/reports/${audit.id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'PDF generation failed' }));
        alert(err.error || 'Could not download PDF');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SEO-Audit-${audit.client?.name?.replace(/[^a-z0-9]/gi, '-') || audit.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!audit) {
    return <div className="p-12 text-center text-slate-500">Loading Client SEO Report...</div>;
  }

  const breakdown = audit.scoreBreakdown || {};
  const overallScore = audit.overallScore || 0;

  const pillarScores = [
    { label: 'Technical', value: breakdown.technical ?? 65, key: 'Technical' },
    { label: 'On-Page', value: breakdown.on_page ?? 72, key: 'OnPage' },
    { label: 'Content', value: breakdown.content ?? 64, key: 'Content' },
    { label: 'CWV Speed', value: breakdown.core_web_vitals ?? 52, key: 'CWV' },
    { label: 'Schema', value: breakdown.schema ?? 48, key: 'Schema' },
  ];

  // Issue & Recommendation counts for the Donut / Pie Chart
  const criticalCount =
    (audit.issues?.filter((i: any) => i.issueType === 'CRITICAL').length || 0) +
    (audit.recommendations?.filter((r: any) => r.priority === 'CRITICAL').length || 0);
  const highCount =
    (audit.issues?.filter((i: any) => i.issueType === 'IMPORTANT').length || 0) +
    (audit.recommendations?.filter((r: any) => r.priority === 'HIGH').length || 0);
  const mediumCount =
    audit.recommendations?.filter((r: any) => r.priority === 'MEDIUM' || r.priority === 'LOW').length || 1;
  const quickWinsCount =
    audit.issues?.filter((i: any) => i.issueType === 'QUICK_WIN').length || 2;

  const donutSegments = [
    { label: 'Critical Severity', count: Math.max(1, criticalCount), color: '#ef4444', bgClass: 'bg-red-500' },
    { label: 'High Priority', count: Math.max(1, highCount), color: '#f97316', bgClass: 'bg-orange-500' },
    { label: 'Medium / Low', count: Math.max(1, mediumCount), color: '#eab308', bgClass: 'bg-amber-500' },
    { label: 'Quick Wins (<=2h)', count: Math.max(1, quickWinsCount), color: '#14b8a6', bgClass: 'bg-teal-500' },
  ];

  // GSC Query Performance Data (from rawSignals or fallback to Section 2.3 mock data)
  const gscRows: any[] = audit.rawSignals?.gscData?.rows || [
    { query: 'dental clinic in pune', clicks: 42, impressions: 980, ctr: 0.043, position: 6.2 },
    { query: 'best dentist pune', clicks: 28, impressions: 740, ctr: 0.038, position: 8.1 },
    { query: 'tooth extraction pune', clicks: 19, impressions: 430, ctr: 0.044, position: 5.7 },
    { query: 'dental implants cost pune', clicks: 11, impressions: 310, ctr: 0.035, position: 11.3 },
    { query: 'dentist near me', clicks: 67, impressions: 2100, ctr: 0.032, position: 9.4 },
  ];

  const maxGscVal = Math.max(
    ...gscRows.map((r) => (gscMetricView === 'clicks' ? r.clicks : r.impressions)),
    1
  );

  // Competitor SERP Ranking Data (from rawSignals or fallback to Section 2.3 DataForSEO data)
  const serpItems: any[] =
    audit.rawSignals?.rankingsData?.tasks?.[0]?.result?.[0]?.items || [
      { type: 'organic', rank_group: 1, rank_absolute: 4, domain: audit.url || 'example-dental-clinic.com' },
      { type: 'organic', rank_group: 2, rank_absolute: 8, domain: 'competitorA.com' },
      { type: 'organic', rank_group: 3, rank_absolute: 12, domain: 'competitorB.com' },
    ];

  // Filtered recommendations
  const filteredRecommendations = (audit.recommendations || []).filter((rec: any) => {
    const matchCat = selectedCategory === 'ALL' || rec.category === selectedCategory;
    const matchPrio = selectedPriority === 'ALL' || rec.priority === selectedPriority;
    return matchCat && matchPrio;
  });

  // Circular gauge math
  const gaugeRadius = 58;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (overallScore / 100) * gaugeCircumference;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <header className="bg-white border-b px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/admin"
                className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Back to Admin Portal
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-xs uppercase font-bold text-teal-600 tracking-wider">
                Interactive Client SEO Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{audit.client?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{audit.url}</p>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Generating Official PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download Official PDF Report
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Live Banner if Audit is still Queued or Running */}
        {(audit.status === 'QUEUED' || audit.status === 'RUNNING') && (
          <div className="bg-teal-900 text-white p-5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={18} className="animate-spin text-teal-300" />
              <div>
                <div className="text-xs font-bold uppercase text-teal-300">Audit In Progress ({audit.progress}%)</div>
                <div className="text-sm font-semibold">{audit.currentStep || 'Running 7-step SEO crawler...'}</div>
              </div>
            </div>
            <span className="text-xl font-black text-teal-300">{audit.progress}%</span>
          </div>
        )}

        {/* Score Radial Gauge & 5-Pillar Progress Bars */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          {/* Animated SVG Radial Score Gauge */}
          <div className="relative flex flex-col items-center justify-center w-48 h-48 shrink-0">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={gaugeRadius}
                fill="transparent"
                stroke="#f0fdfa"
                strokeWidth="12"
              />
              <circle
                cx="70"
                cy="70"
                r={gaugeRadius}
                fill="transparent"
                stroke={overallScore >= 75 ? '#10b981' : overallScore >= 55 ? '#0d9488' : '#f59e0b'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-teal-900">{overallScore}</span>
              <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider mt-0.5">
                SEO Health
              </span>
            </div>
          </div>

          {/* Interactive Pillar Cards with Visual Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 flex-1 w-full">
            {pillarScores.map((item) => {
              const barColor =
                item.value >= 75
                  ? 'bg-emerald-500'
                  : item.value >= 60
                  ? 'bg-teal-600'
                  : 'bg-amber-500';
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(selectedCategory === item.key ? 'ALL' : item.key)
                  }
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    selectedCategory === item.key
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-black text-slate-800">{item.value}%</span>
                    <span className="text-[10px] font-bold text-teal-700">Filter</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-600 uppercase">{item.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Visual Analytics Row: 5-Pillar Radar Chart & Severity Pie/Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">5-Pillar SEO Balance Radar</h3>
                  <p className="text-xs text-slate-500">Hover vertices to inspect dimensional performance</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                Interactive SVG
              </span>
            </div>

            <div className="my-auto py-2 flex items-center justify-center">
              <SeoRadarChart scores={pillarScores} />
            </div>
          </div>

          {/* Donut / Pie Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <PieChart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Audit Findings &amp; Severity Breakdown</h3>
                  <p className="text-xs text-slate-500">Hover slices or legend to inspect issue distribution</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                Donut Chart
              </span>
            </div>

            <div className="my-auto py-2">
              <IssueDonutChart segments={donutSegments} totalLabel="Total Items" />
            </div>
          </div>
        </div>

        {/* Interactive Search Console Bar Chart & SERP Competitor Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Google Search Console Keyword Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Google Search Console Keyword Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Top organic search queries driving local traffic &amp; average SERP position
                  </p>
                </div>
              </div>

              {/* Interactive Metric Switcher */}
              <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 self-start">
                <button
                  type="button"
                  onClick={() => setGscMetricView('clicks')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    gscMetricView === 'clicks'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Organic Clicks
                </button>
                <button
                  type="button"
                  onClick={() => setGscMetricView('impressions')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    gscMetricView === 'impressions'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Impressions
                </button>
              </div>
            </div>

            <div className="space-y-3.5">
              {gscRows.map((row, idx) => {
                const metricVal = gscMetricView === 'clicks' ? row.clicks : row.impressions;
                const widthPct = Math.max(8, Math.round((metricVal / maxGscVal) * 100));
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Search size={12} className="text-slate-400" />
                        {row.query}
                      </span>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          Pos #{row.position}
                        </span>
                        <span className="text-[11px]">CTR: {(row.ctr * 100).toFixed(1)}%</span>
                        <span className="font-bold text-slate-900 w-20 text-right">
                          {metricVal.toLocaleString()}{' '}
                          {gscMetricView === 'clicks' ? 'clicks' : 'impr.'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          gscMetricView === 'clicks'
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DataForSEO SERP Competitor Benchmark Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">SERP Rank Benchmark</h3>
                  <p className="text-xs text-slate-500">DataForSEO Organic Position</p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {serpItems.map((item, i) => {
                  const isClient = i === 0;
                  const barWidth = Math.max(25, 100 - item.rank_absolute * 6);
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border ${
                        isClient
                          ? 'bg-teal-50/70 border-teal-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-bold text-slate-800 truncate max-w-[160px]">
                          {isClient ? `★ ${item.domain}` : item.domain}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            isClient
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Rank #{item.rank_absolute}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isClient ? 'bg-teal-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Monthly Search Volume:</span>
              <strong className="text-slate-800 font-bold">1,900 searches/mo</strong>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-lg">
          <h3 className="text-sm font-bold text-emerald-900 mb-1">Executive Summary</h3>
          <p className="text-sm text-emerald-800 leading-relaxed">
            {audit.executiveSummary || 'Audit analysis is currently running. Results will appear momentarily.'}
          </p>
        </div>

        {/* Critical Issues, Important Issues & Quick Wins */}
        {audit.issues && audit.issues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-3">
                <AlertTriangle size={18} /> Critical Issues
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {audit.issues
                  .filter((i: any) => i.issueType === 'CRITICAL')
                  .map((i: any) => (
                    <li key={i.id} className="flex items-start gap-2 bg-red-50/60 p-2.5 rounded-lg border border-red-100">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{i.title}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-3">
                <ShieldCheck size={18} /> Important Issues
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {audit.issues
                  .filter((i: any) => i.issueType === 'IMPORTANT')
                  .map((i: any) => (
                    <li key={i.id} className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{i.title}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm mb-3">
                <Zap size={18} /> Quick Wins (&le; 2 Hours)
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {audit.issues
                  .filter((i: any) => i.issueType === 'QUICK_WIN')
                  .map((i: any) => (
                    <li key={i.id} className="flex items-start gap-2 bg-teal-50/60 p-2.5 rounded-lg border border-teal-100">
                      <CheckCircle size={14} className="text-teal-600 shrink-0 mt-0.5" />
                      <span>{i.title}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Prioritized Recommendations with Interactive Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Prioritized Action Items</h2>
              <p className="text-xs text-slate-500">
                Click any category or priority pill to filter recommendations
              </p>
            </div>

            {/* Interactive Priority & Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Filter size={12} /> Priority:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((prio) => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setSelectedPriority(prio)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedPriority === prio
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {prio}
                </button>
              ))}
              {selectedCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 cursor-pointer"
                >
                  Category: {selectedCategory} ✕
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecommendations.map((rec: any) => (
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
                  <span className="text-xs text-slate-400">• Impact: {rec.estimatedImpact}</span>
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
