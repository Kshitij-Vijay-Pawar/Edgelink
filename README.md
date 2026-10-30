# 🚀 Edgelink Autonomous SEO Auditing Engine & Client Dashboard

An enterprise-grade, autonomous SEO auditing pipeline and client portal built for **Edgelink Technology**. Designed to automate multi-source signal harvesting, AI-powered audits via Claude 3.5 Sonnet, real-time BullMQ background queue processing, automated executive PDF generation, and client delivery notifications.

---

## 🏗️ Architecture Overview

The platform is designed with an asynchronous worker-queue architecture capable of scaling to hundreds of concurrent audits without blocking the web layer:

```
[Admin Portal / Cron-job.org]
             │
             ▼
   POST /api/audits/trigger
             │
             ▼
      [BullMQ Queue] (Upstash Redis / Redis Cloud / Local)
             │
             ▼
     [Auditing Worker] (Node.js Process)
             │
  ┌──────────┴───────────────────────────────┐
  │  7-Step Headless Aggregation Pipeline    │
  │  1. Cheerio HTML Head Scraper            │
  │  2. Google PageSpeed Insights API (Mock) │
  │  3. Google Search Console API (Mock)     │
  │  4. Schema.org / JSON-LD Validation      │
  │  5. On-Page Content & Structure Scraper  │
  │  6. robots.txt & sitemap.xml Scraper     │
  │  7. DataForSEO Local SERP API (Mock)     │
  └──────────┬───────────────────────────────┘
             │ (Aggregated Technical Signals)
             ▼
 [Anthropic Claude 3.5 Sonnet API] (Master SEO Audit System Prompt)
             │ (Structured JSON Output: Scores, Issues, Recommendations)
             ▼
 [Database Persistence] (PostgreSQL via Neon / Supabase & Prisma ORM)
             │
             ├─────────────────────────────────────────┐
             ▼                                         ▼
[Executive PDF Generator] (Puppeteer)        [Twilio WhatsApp Notification]
   Saved to /tmp/reports/*.pdf                  Mock / Real Dispatch
             │                                         │
             └───────────────────┬─────────────────────┘
                                 ▼
                     [Client Self-Serve Portal]
                 (Interactive Scores, Charts, Download)
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, API Route Handlers)
- **UI & Styling**: Tailwind CSS, Lucide Icons, Modern responsive card & metric layout
- **Database**: PostgreSQL (Neon Serverless / Supabase) with **Prisma ORM**
- **Queue & Async Processing**: **BullMQ** with **Upstash Redis** / Redis
- **AI Engine**: **Anthropic Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`)
- **PDF Generation**: **Puppeteer** (Headless Chrome)
- **Scheduling**: cron-job.org endpoint (`/api/cron/audit-scheduler`) with Bearer token authentication

---

## 📦 Directory Structure

```
code/frontend/
├── prisma/
│   ├── schema.prisma         # Full schema: Client, Audit, Recommendation, Issue
│   └── seed.ts               # Database seeder (Sample client: Pune Smile Dental Care)
├── src/
│   ├── app/
│   │   ├── admin/page.tsx    # Admin Dashboard: Trigger audit, live progress bar, steps
│   │   ├── client/[id]/page.tsx # Client Report: Scorecards, issues, recommendations, PDF download
│   │   └── api/
│   │       ├── audits/trigger/route.ts       # Enqueue audit job to BullMQ
│   │       ├── audits/[id]/route.ts          # Real-time polling for audit progress & results
│   │       ├── clients/route.ts              # Fetch clients for dropdown selector
│   │       ├── reports/[auditId]/route.ts    # Stream generated PDF report
│   │       └── cron/audit-scheduler/route.ts # Cron-job.org scheduled webhook endpoint
│   ├── crawlers/
│   │   └── index.ts          # 7-Step Headless Crawler & Signal Aggregator
│   ├── mocks/
│   │   └── index.ts          # Section 2.3 compliant mock data (PageSpeed, GSC, DataForSEO, Twilio)
│   ├── prompts/
│   │   └── masterSeoPrompt.ts # Anthropic Master SEO System Prompt
│   ├── queue/
│   │   └── auditQueue.ts     # BullMQ Queue instance & job enqueuing
│   ├── services/
│   │   ├── claudeService.ts  # Claude 3.5 Sonnet caller with JSON validation
│   │   └── pdfService.ts     # Puppeteer executive PDF generator
│   └── workers/
│       └── auditWorker.ts    # BullMQ worker executing the 7 steps, Claude, DB save, PDF & mock Twilio
└── scripts/
    ├── run-worker.ts         # Standalone worker runner
    ├── test-claude.ts        # Test Claude API prompt integration
    ├── test-crawler.ts       # Test signal harvesting
    ├── test-pdf.ts           # Test Puppeteer PDF rendering
    └── test-enqueue.ts       # Test enqueuing jobs
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or 20.x
- Redis instance (Local Redis `redis://127.0.0.1:6379` or Upstash Redis `rediss://...`)
- PostgreSQL database (Supabase or Neon)
- Anthropic API Key (or use `USE_MOCKS=true`)

### 2. Installation & Environment Setup
Clone the repository and install dependencies:

```bash
cd code/frontend
npm install
```

Copy the example environment file:
```bash
cp .env.example .env
```

Configure `.env`:
```env
# Enable full mocks for free-tier testing
USE_MOCKS=true

# Database (Neon / Supabase)
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# BullMQ Redis
REDIS_URL="redis://127.0.0.1:6379"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."
CLAUDE_MODEL="claude-3-5-sonnet-20241022"

# Cron secret
CRON_SECRET="edgelink-secret-cron-token-2026"

# PDF Destination
PDF_STORAGE_DIR="/tmp/reports"
```

### 3. Database Initialization & Seeding
Push the Prisma schema to PostgreSQL and seed initial client data:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Running the Application

You need two terminal windows running in parallel:

**Terminal 1 — Next.js Web App:**
```bash
npm run dev
```
Access the Admin Portal at [http://localhost:3000/admin](http://localhost:3000/admin).

**Terminal 2 — BullMQ Background Worker:**
```bash
npm run worker
```

---

## 🧪 Verification & Demonstration

1. **Trigger Manual Audit:**
   - Navigate to `http://localhost:3000/admin`.
   - Select **Pune Smile Dental Care** (`https://punesmiledental.in`).
   - Click **"Run Full Audit Pipeline"**.
   - Watch the live progress indicator update across all 7 crawling steps.

2. **Verify Worker Logs:**
   - Observe worker terminal logs:
     ```text
     [Worker] Starting job for audit clxxx... (seo-audit-jobs)
     [Worker] Crawling completed: https://punesmiledental.in
     [Worker] Calling Claude AI for analysis...
     [Worker] Claude analysis complete. Overall Score: 68/100
     [Worker] Generating Executive PDF Report...
     [Worker] PDF generated: /tmp/reports/audit-clxxx.pdf
     [MOCK WHATSAPP] → Client: Pune Smile Dental Care (9876543210) Score: 68/100 Report: /tmp/reports/audit-clxxx.pdf
     ```

3. **Client Report & PDF Download:**
   - Click **"View Client Report"** or open `http://localhost:3000/client/[clientId]`.
   - Review overall score, dimensional breakdown, critical issues, and recommendations.
   - Click **"Download Official PDF Report"** to view and download the Puppeteer generated executive PDF.

4. **Trigger Scheduled Cron (cron-job.org):**
   ```bash
   curl -X GET "http://localhost:3000/api/cron/audit-scheduler?key=edgelink-secret-cron-token-2026"
   ```

---

## 🛡️ Mock Data Policy (Section 2.3)
When `USE_MOCKS=true`:
- PageSpeed Insights: Returns desktop & mobile performance (Desktop: 78, Mobile: 42, LCP: 4.2s).
- Google Search Console: Returns top 5 queries with impressions, clicks, CTR, and average positions.
- DataForSEO: Returns local Pune dental SERP rankings and competitors.
- Twilio WhatsApp: Dispatches simulated WhatsApp message to console logs.
