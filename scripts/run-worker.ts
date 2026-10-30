// scripts/run-worker.ts
import 'dotenv/config';
import { createAuditWorker } from '../src/workers/auditWorker';

console.log('⚡ Starting BullMQ SEO Audit Worker...');
const worker = createAuditWorker();

process.on('SIGTERM', async () => {
  console.log('Stopping worker gracefully...');
  await worker.close();
  process.exit(0);
});
