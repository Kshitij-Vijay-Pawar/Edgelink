// src/app/api/reports/[auditId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAuditPdf } from '@/services/pdfGenerator';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await context.params;
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const forceRegenerate = req.nextUrl.searchParams.get('regenerate') === 'true';
    let pdfPath = audit.pdfPath;

    // Check if existing cached PDF is an old plain-text fallback (< 5KB) or missing
    let needsRegeneration = forceRegenerate || !pdfPath || !fs.existsSync(pdfPath);
    if (!needsRegeneration && pdfPath) {
      try {
        const stats = fs.statSync(pdfPath);
        if (stats.size < 8000) {
          needsRegeneration = true;
        }
      } catch {
        needsRegeneration = true;
      }
    }

    if (needsRegeneration) {
      pdfPath = await generateAuditPdf(auditId);
      await prisma.audit.update({
        where: { id: auditId },
        data: { pdfPath },
      });
    }

    const fileBuffer = fs.readFileSync(pdfPath!);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SEO-Audit-${audit.id}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('PDF Download Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}

