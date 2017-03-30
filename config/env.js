/**
 * Load app configurations
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json');
let configInfo = {};

try {
  fs.statSync(configPath);
} catch (e) {
  fs.writeFileSync(configPath, fs.readFileSync(configPath + '.sample'));
  console.log('creating config file finished');
} finally {
  configInfo = JSON.parse(fs.readFileSync(configPath));
}

function getConfigProperty(key) {
  const valueFormEnv = process.env[key];
  return valueFormEnv ? valueFormEnv : configInfo[key];
}

module.exports = {
  getListeningPort: () => {
    return getConfigProperty('NODE_PORT');
  },
  getNodeEnv: () => {
    return getConfigProperty('NODE_ENV');
  },
  isDevMode: () => {
    const env = getConfigProperty('NODE_ENV');
    return 'dev' === env || 'development' === env;
  },
  isProdMode: () => {
    const env = getConfigProperty('NODE_ENV');
    return 'prod' === env || 'production' === env;
  },
  isNodeProxyEnabled: () => {
    return !!getConfigProperty('NODE_PROXY');
  },
  getStaticAssetsEndpoint: () => {
    //AKA, get CDN domain
    return getConfigProperty('STATIC_ENDPOINT');
  },
  getAppPrefix: () => {
    return getConfigProperty('APP_PREFIX');
  },
  getStaticPrefix: () => {
    return getConfigProperty('STATIC_PREFIX');
  },
  getApiEndPoints: () => {
    return getConfigProperty('API_ENDPOINTS');
  },
  getProxyDebugLevel: () => {
    return getConfigProperty('PROXY_DEBUG_LEVEL');
  },
  getEnv: (key) => {
    return getConfigProperty(key);
  }
};
