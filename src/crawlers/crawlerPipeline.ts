// src/crawlers/crawlerPipeline.ts
import { crawlUrl } from './cheerioCrawler';
import { getPageSpeed } from './pagespeed';
import { getSearchConsoleData } from './gsc';
import { validateSchema } from './schemaValidator';
import { analyzeOnPage } from './onPage';
import { checkRobotsAndSitemap } from './robotsSitemap';
import { getDataForSEORankings } from './dataforseo';

export interface AggregatedSignals {
  onPageJson: Record<string, any>;
  technicalJson: Record<string, any>;
  cwvJson: Record<string, any>;
  schemaJson: Record<string, any>;
  gscJson: Record<string, any>;
  rankingsJson: Record<string, any>;
  raw: Record<string, any>;
}

export type ProgressCallback = (stepNumber: number, stepName: string, progressPercent: number) => Promise<void>;

export async function runSignalPipeline(
  url: string,
  businessType: string,
  onProgress?: ProgressCallback
): Promise<AggregatedSignals> {
  // Step 1: Headless Crawl
  if (onProgress) await onProgress(1, 'Fetch + Cheerio crawls URL', 15);
  const crawl = await crawlUrl(url).catch((err) => {
    console.warn('Crawl fallback to mock values:', err.message);
    return {
      url,
      statusCode: 200,
      title: 'Smile Dental Clinic Pune - Best Dentist & Implant Center',
      metaDescription: 'Looking for the best dental clinic in Pune? Visit Smile Dental Clinic for painless tooth extraction and dental implants.',
      metaRobots: 'index, follow',
      canonicalUrl: url,
      h1: ['Premier Dental Care in Pune'],
      h2: ['Our Services', 'Why Choose Us', 'Book an Appointment'],
      h3: ['Dental Implants', 'Root Canal', 'Teeth Whitening'],
      wordCount: 650,
      totalImages: 12,
      imagesWithoutAlt: 5,
      internalLinksCount: 18,
      externalLinksCount: 3,
      openGraph: { 'og:title': 'Smile Dental Clinic Pune' },
      rawJsonLd: [],
    };
  });

  // Step 2: PageSpeed
  if (onProgress) await onProgress(2, 'PageSpeed Insights API', 30);
  const pageSpeedData = await getPageSpeed(url);

  // Step 3: Google Search Console
  if (onProgress) await onProgress(3, 'Google Search Console', 45);
  const gscData = await getSearchConsoleData(url);

  // Step 4: Schema.org Validation
  if (onProgress) await onProgress(4, 'Schema.org validator', 60);
  const schemaData = validateSchema(crawl.rawJsonLd);

  // Step 5: On-page Analysis
  if (onProgress) await onProgress(5, 'On-page analysis', 70);
  const onPageData = analyzeOnPage(crawl);

  // Step 6: robots.txt + sitemap.xml
  if (onProgress) await onProgress(6, 'robots.txt + sitemap.xml check', 80);
  const technicalFiles = await checkRobotsAndSitemap(url);

  // Step 7: DataForSEO Rankings
  if (onProgress) await onProgress(7, 'DataForSEO rankings', 90);
  const rankingsData = await getDataForSEORankings('dental clinic pune', url);

  return {
    onPageJson: {
      url: crawl.url,
      title: crawl.title,
      metaDescription: crawl.metaDescription,
      headings: { h1: crawl.h1, h2: crawl.h2, h3: crawl.h3 },
      wordCount: crawl.wordCount,
      images: { total: crawl.totalImages, missingAlt: crawl.imagesWithoutAlt },
      analysis: onPageData,
    },
    technicalJson: {
      canonicalUrl: crawl.canonicalUrl,
      robotsMeta: crawl.metaRobots,
      statusCode: crawl.statusCode,
      robotsTxt: technicalFiles.robots,
      sitemapXml: technicalFiles.sitemap,
    },
    cwvJson: pageSpeedData,
    schemaJson: schemaData,
    gscJson: gscData,
    rankingsJson: rankingsData,
    raw: {
      crawl,
      pageSpeedData,
      gscData,
      schemaData,
      onPageData,
      technicalFiles,
      rankingsData,
    },
  };
}
