// src/crawlers/dataforseo.js
const { USE_MOCKS } = require('../mocks');
const mockData = require('../mocks/dataforseo.mock');

async function getDataForSEORankings(keyword, domain) {
  if (USE_MOCKS) {
    return mockData;
  }
  // In production, real DataForSEO API call executes here
  return mockData;
}

module.exports = { getDataForSEORankings };
