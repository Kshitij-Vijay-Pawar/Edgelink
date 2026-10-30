// scripts/test-enqueue.ts
import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { enqueueAudit } from '../src/queue/auditQueue';
import { AuditStatus } from '@prisma/client';

async function main() {
  console.log('🧪 Enqueueing test SEO audit job...');

  // Ensure a test client exists
  let client = await prisma.client.findFirst({
    where: { name: 'Smile Dental Clinic' },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Smile Dental Clinic',
        domain: 'smiledentalpune.in',
        businessType: 'Dental Clinic',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '+919876543210',
        email: 'dr.rahul@smiledentalpune.in',
      },
    });
    console.log('Created test client:', client.id);
  }

  // Create an audit in QUEUED state
  const audit = await prisma.audit.create({
    data: {
      clientId: client.id,
      url: `https://${client.domain}`,
      status: AuditStatus.QUEUED,
      progress: 0,
      currentStep: 'Job Enqueued',
    },
  });

  console.log(`Created Audit record ${audit.id} (Status: QUEUED)`);

  const job = await enqueueAudit({
    auditId: audit.id,
    clientId: client.id,
    url: audit.url,
    businessType: client.businessType,
    city: client.city,
    state: client.state,
  });

  console.log(`✅ Successfully added job to BullMQ queue: Job ID ${job.id}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed to enqueue test job:', err);
  process.exit(1);
});

