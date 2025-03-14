// test/automation/taiko-utils.js
const taiko = require('taiko');
const config = require('./config');

/**
 * Initialize browser with basic settings
 */
const initBrowser = async (options = {}) => {
  return await taiko.openBrowser({
    headless: options.headless !== undefined ? options.headless : config.browser.headless,
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
    slowMo: config.browser.slowMo,
    timeout: config.browser.timeout
  });
};

/**
 * Navigate to a specific path in the NodeBB application
 * @param {string} path - Path to navigate to (without the base URL)
 */
const navigateToPath = async (path = '') => {
  const url = path.startsWith('/') 
    ? `${config.baseUrl}${path}` 
    : `${config.baseUrl}/${path}`;
  await taiko.goto(url);
};

// Export Taiko functions and our helper functions
module.exports = {
  ...taiko,
  config,
  initBrowser,
  navigateToPath
};