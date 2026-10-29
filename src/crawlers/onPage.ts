// src/crawlers/onPage.ts
import { CrawlResult } from './cheerioCrawler';

export interface OnPageAnalysis {
  titleAnalysis: { length: number; status: 'GOOD' | 'TOO_SHORT' | 'TOO_LONG'; text: string };
  metaDescriptionAnalysis: { length: number; status: 'GOOD' | 'TOO_SHORT' | 'TOO_LONG' | 'MISSING'; text: string };
  headingHierarchy: { h1Count: number; h2Count: number; h3Count: number; status: 'OPTIMAL' | 'MULTIPLE_H1' | 'MISSING_H1' };
  imageAltCoverage: { total: number; missingAlt: number; percentage: number };
  contentDepth: { wordCount: number; status: 'THIN' | 'ACCEPTABLE' | 'COMPREHENSIVE' };
  openGraphStatus: { complete: boolean; missingProperties: string[] };
}

export function analyzeOnPage(crawl: CrawlResult): OnPageAnalysis {
  const titleLen = crawl.title.length;
  const titleStatus = titleLen >= 40 && titleLen <= 65 ? 'GOOD' : titleLen < 40 ? 'TOO_SHORT' : 'TOO_LONG';

  const descLen = crawl.metaDescription.length;
  const metaStatus =
    descLen === 0 ? 'MISSING' : descLen >= 120 && descLen <= 160 ? 'GOOD' : descLen < 120 ? 'TOO_SHORT' : 'TOO_LONG';

  const h1Count = crawl.h1.length;
  const headingStatus = h1Count === 1 ? 'OPTIMAL' : h1Count === 0 ? 'MISSING_H1' : 'MULTIPLE_H1';

  const altPercentage =
    crawl.totalImages === 0 ? 100 : Math.round(((crawl.totalImages - crawl.imagesWithoutAlt) / crawl.totalImages) * 100);

  const wordStatus = crawl.wordCount < 300 ? 'THIN' : crawl.wordCount <= 1200 ? 'ACCEPTABLE' : 'COMPREHENSIVE';

  const requiredOg = ['og:title', 'og:description', 'og:image'];
  const missingOg = requiredOg.filter((key) => !crawl.openGraph[key]);

  return {
    titleAnalysis: { length: titleLen, status: titleStatus, text: crawl.title },
    metaDescriptionAnalysis: { length: descLen, status: metaStatus, text: crawl.metaDescription },
    headingHierarchy: { h1Count, h2Count: crawl.h2.length, h3Count: crawl.h3.length, status: headingStatus },
    imageAltCoverage: { total: crawl.totalImages, missingAlt: crawl.imagesWithoutAlt, percentage: altPercentage },
    contentDepth: { wordCount: crawl.wordCount, status: wordStatus },
    openGraphStatus: { complete: missingOg.length === 0, missingProperties: missingOg },
  };
}