// scripts/test-claude.ts
import 'dotenv/config';
import { generateSeoAuditWithClaude } from '../src/services/claudeService';
import { runSignalPipeline } from '../src/crawlers/crawlerPipeline';

async function main() {
  console.log('🧪 Testing Claude Prompt Engine...');
  const signals = await runSignalPipeline('https://example-dental-clinic.com', 'Dental Clinic');
  const result = await generateSeoAuditWithClaude({
    url: 'https://example-dental-clinic.com',
    businessType: 'Dental Clinic',
    city: 'Pune',
    state: 'Maharashtra',
    signals,
  });

  console.log('Overall Score:', result.overall_score);
  console.log('Score Breakdown:', result.score_breakdown);
  console.log('Executive Summary:', result.executive_summary);
  console.log('Recommendations Count:', result.recommendations.length);
  console.log('✅ Claude Engine Test Passed!');
}

main();

