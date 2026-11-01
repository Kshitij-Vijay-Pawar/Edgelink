// src/app/api/audits/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { enqueueAudit, AuditJobData } from '@/queue/auditQueue';
import { executeAuditPipeline } from '@/workers/auditWorker';
import { AuditStatus, TriggerType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      url,
      customClientName,
      customDomain,
      businessType: customBusinessType,
      city: customCity,
      state: customState,
      processAllQueued,
    } = body;

    // Option to process all stuck QUEUED audits immediately
    if (processAllQueued) {
      const queuedAudits = await prisma.audit.findMany({
        where: { status: AuditStatus.QUEUED },
        include: { client: true },
        orderBy: { createdAt: 'asc' },
      });

      // Kick off processing asynchronously in the background
      setImmediate(async () => {
        for (const a of queuedAudits) {
          await executeAuditPipeline({
            auditId: a.id,
            clientId: a.clientId,
            url: a.url,
            businessType: a.client.businessType,
            city: a.client.city,
            state: a.client.state,
          }).catch((e) => console.error('Failed queued audit:', e));
        }
      });

      return NextResponse.json({
        success: true,
        processedCount: queuedAudits.length,
        auditId: queuedAudits[0]?.id || null,
        message: `Processing ${queuedAudits.length} queued audit(s)`,
      });
    }

    let client = null;

    // Support creating/upserting a custom client on the fly if customDomain is provided
    if (customDomain) {
      const normalizedUrl = customDomain.startsWith('http')
        ? customDomain.trim()
        : `https://${customDomain.trim()}`;

      client = await prisma.client.upsert({
        where: { domain: normalizedUrl },
        update: {
          name: customClientName || normalizedUrl,
          businessType: customBusinessType || 'Dental Clinic',
          city: customCity || 'Pune',
          state: customState || 'Maharashtra',
        },
        create: {
          name: customClientName || normalizedUrl,
          domain: normalizedUrl,
          businessType: customBusinessType || 'Dental Clinic',
          city: customCity || 'Pune',
          state: customState || 'Maharashtra',
          phone: '+919876543210',
          email: 'audit@edgelinktechnology.com',
        },
      });
    } else if (clientId) {
      client = await prisma.client.findUnique({
        where: { id: clientId },
      });
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const auditUrl = url ? (url.startsWith('http') ? url : `https://${url}`) : client.domain;

    // 1. Create DB record in QUEUED state
    const audit = await prisma.audit.create({
      data: {
        clientId: client.id,
        url: auditUrl,
        status: AuditStatus.QUEUED,
        progress: 5,
        currentStep: 'Queued in BullMQ (seo-audit-jobs)',
        triggerType: TriggerType.MANUAL,
        startedAt: new Date(),
      },
    });

    const jobPayload: AuditJobData = {
      auditId: audit.id,
      clientId: client.id,
      url: auditUrl,
      businessType: customBusinessType || client.businessType,
      city: customCity || client.city,
      state: customState || client.state,
    };

    // 2. Push job to BullMQ queue: seo-audit-jobs (non-blocking if Redis is unreachable)
    enqueueAudit(jobPayload).catch((err) => {
      console.warn('BullMQ enqueue warning (auto-processor will handle):', err.message);
    });

    // 3. Auto-start execution if a standalone worker hasn't picked it up within 1.5s
    setTimeout(async () => {
      try {
        const check = await prisma.audit.findUnique({ where: { id: audit.id } });
        if (check && check.status === AuditStatus.QUEUED) {
          console.log(`⚡ [Auto-Worker] Executing audit ${audit.id} in background...`);
          await executeAuditPipeline(jobPayload);
        }
      } catch (e) {
        console.error('Auto-worker error:', e);
      }
    }, 1500);

    return NextResponse.json({
      success: true,
      auditId: audit.id,
      message: 'Audit job queued in BullMQ and pipeline started',
    });
  } catch (error: any) {
    console.error('Trigger audit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
