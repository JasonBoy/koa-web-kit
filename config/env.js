/**
 * Load app configurations
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const devConfig = require('./config.default.dev');
const prodConfig = require('./config.default.prod');

//get custom config path from env
const customConfigPath = process.env.NODE_CONFIG_PATH;
const nodeBuildEnv = process.env.NODE_BUILD_ENV;

const defaultConfigJS = './app-config.js';

const configPath = customConfigPath
  ? path.resolve(customConfigPath)
  : path.join(__dirname, defaultConfigJS);
// console.log(configPath);
let configInfo = {};
let hasCustomConfig = true;
let checkMsg = '';

try {
  fs.statSync(configPath);
} catch (e) {
  console.error(e);
  hasCustomConfig = false;
}

if (hasCustomConfig) {
  configInfo = require(configPath);
  checkMsg += `Using [${chalk.green(configPath)}] as app configuration`;
} else {
  configInfo = !nodeBuildEnv ? prodConfig : devConfig;
  checkMsg += `Using [${chalk.green(
    !nodeBuildEnv ? 'config.default.dev' : 'config.default.prod'
  )}] as app configuration`;
}

console.log(checkMsg);

const config = {};
//cache non-empty config from env at init time instead of accessing from process.env at runtime to improve performance
for (let key in configInfo) {
  if (configInfo.hasOwnProperty(key)) {
    const envValue = process.env[key];
    config[key] = envValue || configInfo[key];
  }
}

// console.log(config);

function getConfigProperty(key) {
  let value = undefined;
  if (config.hasOwnProperty(key)) {
    // console.log(`config[${key}] from cache`);
    value = config[key];
  } else {
    // console.log(`config[${key}] from process.env`);
    value = process.env[key];
  }
  return value;
}

module.exports = {
  getListeningPort: () => {
    return getConfigProperty('PORT') || getConfigProperty('NODE_PORT');
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
  isPrefixTailSlashEnabled: () => {
    return !!getConfigProperty('PREFIX_TRAILING_SLASH');
  },
  getApiEndPoints: () => {
    return getConfigProperty('API_ENDPOINTS');
  },
  getProxyDebugLevel: () => {
    return getConfigProperty('PROXY_DEBUG_LEVEL');
  },
  isHMREnabled: () => {
    const val = getConfigProperty('ENABLE_HMR');
    return module.exports.isDevMode() && isTrue(val);
  },
  isBundleAnalyzerEnabled: () => {
    const val = getConfigProperty('BUNDLE_ANALYZER');
    return isTrue(val);
  },
  isCustomAPIPrefix: () => {
    return !!getConfigProperty('CUSTOM_API_PREFIX');
  },
  getEnv: key => {
    return getConfigProperty(key);
  },
};

function isTrue(val) {
  return !!(val && (val === true || val === 'true' || val === '1'));
}
