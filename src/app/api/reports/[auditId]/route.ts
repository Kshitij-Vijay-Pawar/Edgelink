// src/app/api/reports/[auditId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ auditId: string }> }
) {
  const { auditId } = await context.params;
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
  });

  if (!audit || !audit.pdfPath || !fs.existsSync(audit.pdfPath)) {
    return NextResponse.json({ error: 'Report not found or not generated yet' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(audit.pdfPath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SEO-Audit-${audit.id}.pdf"`,
    },
  });
}
