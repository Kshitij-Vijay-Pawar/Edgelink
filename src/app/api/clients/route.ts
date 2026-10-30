// src/app/api/clients/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const recentAudits = await prisma.audit.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    return NextResponse.json({
      clients,
      recentAudits,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

