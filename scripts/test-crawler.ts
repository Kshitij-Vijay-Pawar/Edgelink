// scripts/test-crawler.ts
import { runSignalPipeline } from '../src/crawlers/crawlerPipeline';

async function test() {
  console.log('Testing Signal Pipeline...');
  const result = await runSignalPipeline('https://example.com', 'Dental Clinic', async (step, name, pct) => {
    console.log(`[${pct}%] Step ${step}: ${name}`);
  });
  console.log('✅ Pipeline finished. CWV Performance score:', result.cwvJson.categories.performance.score);
  console.log('✅ GSC Clicks:', result.gscJson.totalClicks);
  console.log('✅ DataForSEO Client Rank:', result.rankingsJson.client_rank_position);
  console.log('✅ Payload keys:', Object.keys(result));
}

test();

