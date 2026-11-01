// src/app/api/clients/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_CLIENTS = [
  {
    name: 'Pune Smile Dental Care & Implant Center',
    domain: 'https://example-dental-clinic.com',
    businessType: 'Dental Clinic',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+919876543210',
    email: 'contact@example-dental-clinic.com',
  },
  {
    name: 'Pune Premier Realty & Properties',
    domain: 'https://pune-premier-realty.in',
    businessType: 'Real Estate Agency',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+919876501234',
    email: 'info@pune-premier-realty.in',
  },
  {
    name: 'Sahyadri Multispeciality Healthcare Clinic',
    domain: 'https://sahyadri-healthcare-pune.in',
    businessType: 'Healthcare Clinic',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '+919876511122',
    email: 'care@sahyadri-healthcare-pune.in',
  },
  {
    name: 'Mumbai Apex Dental & Orthodontics',
    domain: 'https://mumbai-apex-dental.com',
    businessType: 'Dental Clinic',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+919820012345',
    email: 'hello@mumbai-apex-dental.com',
  },
  {
    name: 'Bangalore Skyline Builders & Developers',
    domain: 'https://bangalore-skyline-realty.in',
    businessType: 'Real Estate',
    city: 'Bengaluru',
    state: 'Karnataka',
    phone: '+919845098765',
    email: 'sales@bangalore-skyline-realty.in',
  },
];

export async function GET() {
  try {
    let clients = await prisma.client.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Ensure all 5 default assessment preset clients exist
    if (clients.length < DEFAULT_CLIENTS.length) {
      for (const preset of DEFAULT_CLIENTS) {
        await prisma.client.upsert({
          where: { domain: preset.domain },
          update: {},
          create: preset,
        });
      }
      clients = await prisma.client.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    const recentAudits = await prisma.audit.findMany({
      take: 15,
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

