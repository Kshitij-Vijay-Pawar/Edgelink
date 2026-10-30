// src/app/api/audits/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { enqueueAudit } from '@/queue/auditQueue';
import { AuditStatus, TriggerType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { clientId, url } = await req.json();

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const auditUrl = url || client.domain;

    // 1. Create DB record in QUEUED state
    const audit = await prisma.audit.create({
      data: {
        clientId: client.id,
        url: auditUrl,
        status: AuditStatus.QUEUED,
        progress: 0,
        currentStep: 'Queued in BullMQ',
        triggerType: TriggerType.MANUAL,
        startedAt: new Date(),
      },
    });

    // 2. Push job to BullMQ queue: seo-audit-jobs
    await enqueueAudit({
      auditId: audit.id,
      clientId: client.id,
      url: auditUrl,
      businessType: client.businessType,
      city: client.city,
      state: client.state,
    });

    return NextResponse.json({
      success: true,
      auditId: audit.id,
      message: 'Audit job queued in BullMQ',
    });
  } catch (error: any) {
    console.error('Trigger audit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
