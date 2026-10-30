// src/workers/auditWorker.ts
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue/redis';
import { AUDIT_QUEUE_NAME, AuditJobData } from '../queue/auditQueue';
import prisma from '../lib/prisma';
import { AuditStatus } from '@prisma/client';
import { runSignalPipeline } from '../crawlers/crawlerPipeline';
import { generateSeoAuditWithClaude } from '../services/claudeService';
import { generateAuditPdf } from '../services/pdfGenerator';
import { dispatchNotifications } from '../services/notificationService';

export function createAuditWorker() {
  const worker = new Worker<AuditJobData>(
    AUDIT_QUEUE_NAME,
    async (job: Job<AuditJobData>) => {
      const { auditId, clientId, url, businessType, city, state } = job.data;
      console.log(`🚀 [Worker] Starting job ${job.id} for audit ${auditId} (${url})`);

      // Helper to update DB progress
      const updateProgress = async (stepName: string, progress: number) => {
        await job.updateProgress(progress);
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: AuditStatus.RUNNING,
            currentStep: stepName,
            progress,
          },
        });
        console.log(`📊 [Audit ${auditId}] ${progress}% — ${stepName}`);
      };

      try {
        await updateProgress('Initializing crawl pipeline', 5);

        // 1. Gather all 7 signals
        const signals = await runSignalPipeline(url, businessType, async (stepNum, stepName, pct) => {
          await updateProgress(`Step ${stepNum}: ${stepName}`, pct);
        });

        // 2. Claude AI Analysis Engine
        await updateProgress('Claude API: Analysing signals & generating recommendations', 82);
        const aiAuditResult = await generateSeoAuditWithClaude({
          url,
          businessType,
          city,
          state,
          signals,
        });

        // 3. Persist Audit Result to Database
        await updateProgress('Supabase/Neon: Storing structured audit results', 90);
        await prisma.$transaction(async (tx) => {
          // Update main audit record
          await tx.audit.update({
            where: { id: auditId },
            data: {
              overallScore: aiAuditResult.overall_score,
              scoreBreakdown: aiAuditResult.score_breakdown,
              executiveSummary: aiAuditResult.executive_summary,
              rawSignals: signals.raw,
              aiResponse: aiAuditResult as any,
              auditVersion: aiAuditResult.audit_version || 'v1.0',
            },
          });

          // Insert recommendations
          if (aiAuditResult.recommendations?.length) {
            await tx.recommendation.createMany({
              data: aiAuditResult.recommendations.map((rec) => ({
                auditId,
                priority: rec.priority as any,
                category: rec.category as any,
                finding: rec.finding,
                fix: rec.fix,
                estimatedImpact: rec.estimated_impact,
                effort: rec.effort,
                falsifiabilityCheck: rec.falsifiability_check,
              })),
            });
          }

          // Insert issues
          const issuesData: any[] = [];
          aiAuditResult.critical_issues?.forEach((title) =>
            issuesData.push({ auditId, issueType: 'CRITICAL', title })
          );
          aiAuditResult.important_issues?.forEach((title) =>
            issuesData.push({ auditId, issueType: 'IMPORTANT', title })
          );
          aiAuditResult.quick_wins?.forEach((title) =>
            issuesData.push({ auditId, issueType: 'QUICK_WIN', title })
          );
          if (issuesData.length > 0) {
            await tx.issue.createMany({ data: issuesData });
          }
        });

        // 4. Generate PDF Report via Puppeteer
        await updateProgress('PDF Report Generator: Generating executive PDF', 95);
        const pdfFilePath = await generateAuditPdf(auditId);

        // 5. Dispatch Notifications (Twilio WhatsApp Mock & Email)
        await updateProgress('Twilio WhatsApp: Dispatching client notifications', 98);
        await dispatchNotifications(auditId, clientId, pdfFilePath, aiAuditResult.overall_score);

        // 6. Complete Audit
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: AuditStatus.COMPLETED,
            progress: 100,
            currentStep: 'Audit Completed Successfully',
            pdfPath: pdfFilePath,
            completedAt: new Date(),
          },
        });

        console.log(`✅ [Worker] Successfully completed audit ${auditId}`);
        return { success: true, auditId, pdfFilePath };
      } catch (err: any) {
        console.error(`❌ [Worker] Failed audit ${auditId}:`, err);
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            status: AuditStatus.FAILED,
            currentStep: 'Audit Failed',
            error: err.message || 'Unknown worker error',
          },
        });
        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`💥 [BullMQ] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

