/**
 * Load app configurations
 */

const fs = require('fs');
const path = require('path');
const devConfig = require('./build.dev');
const prodConfig = require('./build.prod');

//get custom config path from env
const customConfigPath = process.env.NODE_CONFIG_PATH;
const nodeBuildEnv = process.env.NODE_BUILD_ENV;

const configPath = customConfigPath
  ? path.resolve(customConfigPath)
  : path.join(process.cwd(), 'config.json');
// console.log(configPath);
let configInfo = {};

let hasConfigDotJSON = true;

try {
  fs.statSync(configPath);
} catch (e) {
  hasConfigDotJSON = false;
  // fs.writeFileSync(configPath, fs.readFileSync(configPath + '.sample'));
  // console.log('creating config file finished');
} finally {
  console.log('check config.json done');
}

if (hasConfigDotJSON) {
  configInfo = JSON.parse(fs.readFileSync(configPath));
  console.log('using config.json');
} else {
  configInfo = !nodeBuildEnv ? prodConfig : devConfig;
  console.log(`using ${!nodeBuildEnv ? 'build.prod' : 'build.dev'}`);
}

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
