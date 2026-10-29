// src/crawlers/cheerioCrawler.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawlResult {
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  metaRobots: string;
  canonicalUrl: string;
  h1: string[];
  h2: string[];
  h3: string[];
  wordCount: number;
  totalImages: number;
  imagesWithoutAlt: number;
  internalLinksCount: number;
  externalLinksCount: number;
  openGraph: Record<string, string>;
  rawJsonLd: any[];
}

export async function crawlUrl(targetUrl: string): Promise<CrawlResult> {
  const response = await axios.get(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 EdgelinkBot/1.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 12000,
    maxRedirects: 5,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  // Extract titles and meta
  const title = $('title').text().trim() || '';
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
  const metaRobots = $('meta[name="robots"]').attr('content')?.trim() || 'index, follow';
  const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || '';

  // Headings
  const h1 = $('h1').map((_, el) => $(el).text().trim()).get();
  const h2 = $('h2').map((_, el) => $(el).text().trim()).get();
  const h3 = $('h3').map((_, el) => $(el).text().trim()).get();

  // Word count (body text without scripts/styles)
  $('script, style, noscript, nav, footer').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').length : 0;

  // Images
  const allImages = $('img');
  let imagesWithoutAlt = 0;
  allImages.each((_, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') imagesWithoutAlt++;
  });

  // Links
  const baseUrl = new URL(targetUrl);
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          const linkUrl = new URL(href);
          if (linkUrl.hostname === baseUrl.hostname) internalLinksCount++;
          else externalLinksCount++;
        } catch {
          // ignore malformed URLs
        }
      } else if (!href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
        internalLinksCount++;
      }
    }
  });

  // OpenGraph
  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property');
    const content = $(el).attr('content');
    if (prop && content) openGraph[prop] = content;
  });

  // JSON-LD scripts
  const rawJsonLd: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || '{}');
      rawJsonLd.push(parsed);
    } catch {
      // invalid JSON in script tag
    }
  });

  return {
    url: targetUrl,
    statusCode: response.status,
    title,
    metaDescription,
    metaRobots,
    canonicalUrl,
    h1,
    h2,
    h3,
    wordCount,
    totalImages: allImages.length,
    imagesWithoutAlt,
    internalLinksCount,
    externalLinksCount,
    openGraph,
    rawJsonLd,
  };
}