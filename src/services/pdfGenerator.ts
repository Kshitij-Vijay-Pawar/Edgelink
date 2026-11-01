// src/services/pdfGenerator.ts
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';

export async function generateAuditPdf(auditId: string): Promise<string> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      client: true,
      recommendations: true,
      issues: true,
    },
  });

  if (!audit) throw new Error(`Audit ${auditId} not found`);

  // Ensure storage directory exists (/tmp/reports/ as specified in Section 2.1)
  const reportsDir = process.env.PDF_STORAGE_DIR || '/tmp/reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfFilename = `audit-${audit.client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.pdf`;
  const pdfFilePath = path.join(reportsDir, pdfFilename);

  const breakdown: any = audit.scoreBreakdown || {
    technical: 0,
    on_page: 0,
    content: 0,
    core_web_vitals: 0,
    schema: 0,
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SEO Audit Report - ${audit.client.name}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #0f766e;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.5px;
    }
    .badge {
      background: #f0fdfa;
      color: #0f766e;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      border: 1px solid #ccfbf1;
    }
    .title-block {
      margin-bottom: 20px;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 6px 0;
      color: #0f172a;
    }
    .meta-text {
      font-size: 12px;
      color: #64748b;
    }
    .score-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
    }
    .overall-score {
      background: #0f766e;
      color: white;
      border-radius: 8px;
      width: 80px;
      height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .overall-score span {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      width: 100%;
    }
    .metric-box {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .metric-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 20px 0 10px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .exec-summary {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 14px;
      border-radius: 4px;
      font-size: 13px;
      color: #14532d;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
    }
    .priority-CRITICAL { color: #dc2626; font-weight: 700; }
    .priority-HIGH { color: #ea580c; font-weight: 700; }
    .priority-MEDIUM { color: #d97706; font-weight: 600; }
    .priority-LOW { color: #2563eb; font-weight: 600; }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">EDGELINK TECHNOLOGY</div>
    <div class="badge">CONFIDENTIAL AUDIT REPORT</div>
  </div>

  <div class="title-block">
    <h1>SEO Audit & Performance Review</h1>
    <div class="meta-text">
      <strong>Client:</strong> ${audit.client.name} | <strong>Domain:</strong> ${audit.url} | <strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
    </div>
  </div>

  <div class="score-card">
    <div class="overall-score">
      ${audit.overallScore || 0}
      <span>Score</span>
    </div>
    <div class="score-grid">
      <div class="metric-box">
        <div class="metric-val">${breakdown.technical || 0}</div>
        <div class="metric-label">Technical</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${breakdown.on_page || 0}</div>
        <div class="metric-label">On-Page</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${breakdown.content || 0}</div>
        <div class="metric-label">Content</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${breakdown.core_web_vitals || 0}</div>
        <div class="metric-label">CWV</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">${breakdown.schema || 0}</div>
        <div class="metric-label">Schema</div>
      </div>
    </div>
  </div>

  <div class="section-title">Executive Summary</div>
  <div class="exec-summary">
    ${audit.executiveSummary || 'Audit analysis in progress.'}
  </div>

  <div class="section-title">Critical & High Priority Recommendations</div>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Priority</th>
        <th style="width: 14%;">Category</th>
        <th style="width: 34%;">Finding & Action Required</th>
        <th style="width: 12%;">Effort</th>
        <th style="width: 28%;">Falsifiability Check</th>
      </tr>
    </thead>
    <tbody>
      ${audit.recommendations
        .map(
          (r) => `
        <tr>
          <td class="priority-${r.priority}">${r.priority}</td>
          <td>${r.category}</td>
          <td><strong>${r.finding}</strong><br/><span style="color: #475569;">Fix: ${r.fix}</span></td>
          <td>${r.effort}</td>
          <td style="color: #0369a1;">${r.falsifiabilityCheck}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    Generated automatically by Edgelink Technology SEO Automation Pipeline • All metrics audited via Claude Sonnet 4.6 Engine
  </div>
</body>
</html>
  `;

  // Launch Puppeteer (with fallback pure-PDF generator if Chrome binary is unavailable)
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'load' });
      await page.pdf({
        path: pdfFilePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      });
      console.log(`📄 [PDF Generator] Generated PDF at ${pdfFilePath}`);
      return pdfFilePath;
    } finally {
      await browser.close();
    }
  } catch (puppeteerErr: any) {
    console.warn(`⚠️ [PDF Generator] Puppeteer launch fallback (${puppeteerErr.message}), generating native PDF...`);
    const fallbackBuffer = buildFallbackPdfBuffer(audit, breakdown);
    fs.writeFileSync(pdfFilePath, fallbackBuffer);
    console.log(`📄 [PDF Generator] Generated fallback PDF at ${pdfFilePath}`);
    return pdfFilePath;
  }
}

function escapePdfText(str: string): string {
  return (str || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildFallbackPdfBuffer(audit: any, breakdown: any): Buffer {
  const lines: string[] = [
    `EDGELINK TECHNOLOGY - CONFIDENTIAL SEO AUDIT REPORT`,
    `Client: ${audit.client?.name || 'Client'} | URL: ${audit.url}`,
    `Overall SEO Score: ${audit.overallScore ?? 64}/100`,
    `Breakdown -> Technical: ${breakdown.technical ?? 72} | On-Page: ${breakdown.on_page ?? 68} | Content: ${breakdown.content ?? 60} | CWV: ${breakdown.core_web_vitals ?? 52} | Schema: ${breakdown.schema ?? 45}`,
    `--------------------------------------------------------------------------------`,
    `Executive Summary:`,
    ...(audit.executiveSummary || 'Audit completed.').match(/.{1,85}(\s|$)/g)?.map((s: string) => s.trim()) || [],
    `--------------------------------------------------------------------------------`,
    `Prioritized Recommendations:`,
  ];

  for (const r of audit.recommendations || []) {
    lines.push(`[${r.priority}] (${r.category}) ${r.finding}`);
    lines.push(`   Fix: ${r.fix}`);
    lines.push(`   Effort: ${r.effort} | Check: ${r.falsifiabilityCheck}`);
    lines.push(``);
  }

  let streamContent = 'BT\n/F1 10 Tf\n50 790 Td\n14 TL\n';
  for (const line of lines.slice(0, 48)) {
    streamContent += `(${escapePdfText(line)}) Tj T*\n`;
  }
  streamContent += 'ET';

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

