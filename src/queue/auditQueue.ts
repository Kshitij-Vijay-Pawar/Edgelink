// src/queue/auditQueue.ts
import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const AUDIT_QUEUE_NAME = 'seo-audit-jobs';

export interface AuditJobData {
  auditId: string;
  clientId: string;
  url: string;
  businessType: string;
  city: string;
  state: string;
}

export const auditQueue = new Queue<AuditJobData>(AUDIT_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export async function enqueueAudit(data: AuditJobData) {
  return await auditQueue.add('seo-audit-task', data, {
    jobId: data.auditId,
  });
}
