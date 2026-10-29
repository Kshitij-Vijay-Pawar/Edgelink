// prisma/seed.ts
import { PrismaClient, AuditStatus, TriggerType, PriorityLevel, RecommendationCategory, IssueType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Primary Test Client: Dental Clinic in Pune (matches mock data)
  const dentalClient = await prisma.client.upsert({
    where: { domain: 'https://example-dental-clinic.com' },
    update: {},
    create: {
      name: 'Pune Smile Dental Care & Implant Center',
      domain: 'https://example-dental-clinic.com',
      businessType: 'Dental Clinic',
      city: 'Pune',
      state: 'Maharashtra',
      phone: '+919876543210',
      email: 'contact@example-dental-clinic.com',
    },
  });

  // 2. Secondary Test Client: Real Estate in Pune
  const realEstateClient = await prisma.client.upsert({
    where: { domain: 'https://pune-premier-realty.in' },
    update: {},
    create: {
      name: 'Pune Premier Realty & Properties',
      domain: 'https://pune-premier-realty.in',
      businessType: 'Real Estate Agency',
      city: 'Pune',
      state: 'Maharashtra',
      phone: '+919876501234',
      email: 'info@pune-premier-realty.in',
    },
  });

  // 3. Create a completed baseline audit for the dental clinic
  const baselineAudit = await prisma.audit.create({
    data: {
      clientId: dentalClient.id,
      url: 'https://example-dental-clinic.com',
      status: AuditStatus.COMPLETED,
      progress: 100,
      currentStep: 'Audit Completed',
      overallScore: 68,
      scoreBreakdown: {
        technical: 65,
        on_page: 82,
        content: 70,
        core_web_vitals: 58,
        schema: 65,
      },
      executiveSummary:
        'Pune Smile Dental Care has good baseline on-page content targeting key local keywords, but mobile page speed (LCP 4.2s) and missing LocalBusiness schema severely hamper local 3-pack visibility. Implementing Dentist structured data and caching unused JavaScript will yield immediate ranking gains.',
      triggerType: TriggerType.MANUAL,
      pdfPath: '/tmp/reports/audit-baseline-example-dental-clinic.pdf',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      recommendations: {
        create: [
          {
            priority: PriorityLevel.CRITICAL,
            category: RecommendationCategory.CWV,
            finding: 'Largest Contentful Paint is 4.2 seconds on mobile devices.',
            fix: 'Compress hero banner image to WebP and defer 420 KiB of unused JavaScript bundles.',
            estimatedImpact: 'High',
            effort: 'Hours',
            falsifiabilityCheck: 'PageSpeed Insights mobile LCP drops below 2.5 seconds on repeat audit.',
          },
          {
            priority: PriorityLevel.HIGH,
            category: RecommendationCategory.Schema,
            finding: 'Missing Dentist/MedicalBusiness JSON-LD schema on homepage.',
            fix: 'Embed Schema.org/Dentist JSON-LD with geo-coordinates, openingHours, and telephone.',
            estimatedImpact: 'High',
            effort: 'Hours',
            falsifiabilityCheck: 'Google Rich Results Test confirms valid Dentist structured data with 0 errors.',
          },
        ],
      },
      issues: {
        create: [
          {
            issueType: IssueType.CRITICAL,
            title: 'Poor Mobile Performance (LCP 4.2s)',
            description: 'Hero assets block mobile rendering and decrease rankings.',
          },
          {
            issueType: IssueType.QUICK_WIN,
            title: 'Add meta description to Service pages',
            description: 'Can be completed in under 45 minutes.',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded clients: ${dentalClient.name}, ${realEstateClient.name}`);
  console.log(`✅ Seeded baseline audit: ${baselineAudit.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });