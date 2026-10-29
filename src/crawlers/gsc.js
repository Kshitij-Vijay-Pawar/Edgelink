// src/crawlers/gsc.js
const { USE_MOCKS } = require('../mocks');
const mockData = require('../mocks/gsc.mock');

async function getSearchConsoleData(url) {
  if (USE_MOCKS) {
    return mockData;
  }
  // GSC OAuth and domain verification is complex; returns mock data as specified in doc
  return mockData;
}

module.exports = { getSearchConsoleData };
