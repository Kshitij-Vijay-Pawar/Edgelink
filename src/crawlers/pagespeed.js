// src/crawlers/pagespeed.js
const { USE_MOCKS } = require('../mocks');
const mockData = require('../mocks/pagespeed.mock');
const axios = require('axios');

async function getPageSpeed(url) {
  if (USE_MOCKS) {
    return mockData;
  }

  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`;
    const res = await axios.get(apiUrl, { timeout: 15000 });
    const lighthouse = res.data.lighthouseResult;

    return {
      url,
      strategy: 'mobile',
      categories: {
        performance: { score: lighthouse.categories.performance?.score || 0 },
        seo: { score: lighthouse.categories.seo?.score || 0 },
        accessibility: { score: lighthouse.categories.accessibility?.score || 0 },
      },
      audits: {
        'largest-contentful-paint': lighthouse.audits['largest-contentful-paint'],
        'cumulative-layout-shift': lighthouse.audits['cumulative-layout-shift'],
        'interaction-to-next-paint': lighthouse.audits['interaction-to-next-paint'],
        'render-blocking-resources': lighthouse.audits['render-blocking-resources'],
        'unused-javascript': lighthouse.audits['unused-javascript'],
      },
    };
  } catch (error) {
    console.warn('[PageSpeed] API error, falling back to mock:', error.message);
    return mockData;
  }
}

module.exports = { getPageSpeed };
