// src/app/api/cron/audit-scheduler/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { enqueueAudit } from '@/queue/auditQueue';
import { AuditStatus, TriggerType } from '@prisma/client';

export async function GET(req: NextRequest) {
  // Validate authorization header / secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'edgelink-secret-cron-token-2026';

  if (authHeader !== `Bearer ${cronSecret}` && req.nextUrl.searchParams.get('key') !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    // Find clients who haven't had an audit in 30 days or never audited
    const clientsToAudit = await prisma.client.findMany({
      take: 2,
      orderBy: { updatedAt: 'asc' },
    });

    const enqueued: string[] = [];

    for (const client of clientsToAudit) {
      const audit = await prisma.audit.create({
        data: {
          clientId: client.id,
          url: client.domain,
          status: AuditStatus.QUEUED,
          progress: 0,
          currentStep: 'Triggered by cron-job.org',
          triggerType: TriggerType.CRON,
        },
      });

      await enqueueAudit({
        auditId: audit.id,
        clientId: client.id,
        url: client.domain,
        businessType: client.businessType,
        city: client.city,
        state: client.state,
      });

      enqueued.push(audit.id);
    }

    return NextResponse.json({
      success: true,
      message: `Enqueued ${enqueued.length} scheduled audits`,
      auditIds: enqueued,
    });
  } catch (error: any) {
    console.error('Cron audit scheduler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

