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

    let pdfPath = audit.pdfPath;

    // Generate the PDF on the fly if not yet generated or if /tmp/reports was cleared
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      pdfPath = await generateAuditPdf(auditId);
      await prisma.audit.update({
        where: { id: auditId },
        data: { pdfPath },
      });
    }

    const fileBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SEO-Audit-${audit.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF Download Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
