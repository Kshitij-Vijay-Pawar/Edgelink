// scripts/test-pdf.ts
import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { generateAuditPdf } from '../src/services/pdfGenerator';
import { dispatchNotifications } from '../src/services/notificationService';

async function test() {
  const audit = await prisma.audit.findFirst({
    where: { status: 'COMPLETED' },
    include: { client: true },
  });

  if (!audit) {
    console.error('No completed audit found. Run seed script first.');
    return;
  }

  console.log(`Generating PDF for audit ${audit.id}...`);
  const pdfPath = await generateAuditPdf(audit.id);
  console.log(`PDF successfully created at: ${pdfPath}`);

  console.log('Dispatching notifications...');
  await dispatchNotifications(audit.id, audit.clientId, pdfPath, audit.overallScore);
  console.log('✅ Phase 6 verification complete!');
}

test();

