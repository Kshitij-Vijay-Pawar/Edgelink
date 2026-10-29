// src/services/notificationService.ts
import prisma from '../lib/prisma';
const { sendWhatsApp } = require('../mocks/twilio.mock');

export async function dispatchNotifications(
  auditId: string,
  clientId: string,
  pdfPath: string,
  score: number | null
) {
  const finalScore = score ?? 0;

  // 1. WhatsApp Delivery via Mock
  console.log('📱 [Notification] Triggering WhatsApp dispatch...');
  const waResult = await sendWhatsApp(clientId, pdfPath, finalScore);

  // 2. Persist to NotificationLog in PostgreSQL
  await prisma.notificationLog.create({
    data: {
      auditId,
      channel: 'WHATSAPP',
      recipient: clientId,
      status: waResult.status || 'MOCK_SENT',
      externalSid: waResult.sid || 'MOCK_SID',
      payload: { pdfPath, score: finalScore },
    },
  });

  // 3. Email Notification Stub
  console.log(`📧 [MOCK EMAIL] → Client: ${clientId} | Subject: Your SEO Audit Report is Ready (${finalScore}/100)`);
  await prisma.notificationLog.create({
    data: {
      auditId,
      channel: 'EMAIL',
      recipient: clientId,
      status: 'MOCK_SENT',
      externalSid: 'MOCK_EMAIL_' + Date.now(),
      payload: { pdfPath, score: finalScore },
    },
  });

  return { success: true };
}

