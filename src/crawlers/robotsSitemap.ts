// src/crawlers/robotsSitemap.ts
import axios from 'axios';

export interface TechnicalFilesCheck {
  robots: {
    exists: boolean;
    url: string;
    hasSitemapDirective: boolean;
    disallowsAll: boolean;
  };
  sitemap: {
    exists: boolean;
    url: string;
    urlCountEstimate: number;
  };
}

export async function checkRobotsAndSitemap(targetUrl: string): Promise<TechnicalFilesCheck> {
  const urlObj = new URL(targetUrl);
  const robotsUrl = `${urlObj.origin}/robots.txt`;
  const sitemapUrl = `${urlObj.origin}/sitemap.xml`;

  let robotsResult = { exists: false, url: robotsUrl, hasSitemapDirective: false, disallowsAll: false };
  let sitemapResult = { exists: false, url: sitemapUrl, urlCountEstimate: 0 };

  // 1. Check robots.txt
  try {
    const res = await axios.get(robotsUrl, { timeout: 6000 });
    if (res.status === 200 && typeof res.data === 'string') {
      robotsResult.exists = true;
      robotsResult.hasSitemapDirective = /sitemap:/i.test(res.data);
      robotsResult.disallowsAll = /disallow:\s*\/\s*$/im.test(res.data);
    }
  } catch {
    robotsResult.exists = false;
  }

  // 2. Check sitemap.xml
  try {
    const res = await axios.get(sitemapUrl, { timeout: 6000 });
    if (res.status === 200 && typeof res.data === 'string') {
      sitemapResult.exists = true;
      const urlMatches = res.data.match(/<url>/g);
      sitemapResult.urlCountEstimate = urlMatches ? urlMatches.length : 1;
    }
  } catch {
    sitemapResult.exists = false;
  }

  return { robots: robotsResult, sitemap: sitemapResult };
}