/**
 * Load app configurations
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const devConfig = require('./config.default.dev');
const prodConfig = require('./config.default.prod');

/**
 * app configs
 * @type {{}}
 */
let config = {};

//get custom config path from env
const customConfigPath = process.env.NODE_CONFIG_PATH;
const nodeBuildEnv = process.env.NODE_BUILD_ENV;

const DEFAULT_PREFIX_KEY = 'defaultPrefix';

const DEFAULT_CONFIG_FILE_NAME = 'app-config.js';

function initConfig(customConfig) {
  let defaultConfigJS = `../${DEFAULT_CONFIG_FILE_NAME}`;
  const defaultConfigJSAlt = `./${DEFAULT_CONFIG_FILE_NAME}`;

  try {
    fs.statSync(path.join(__dirname, defaultConfigJS));
  } catch (e) {
    defaultConfigJS = defaultConfigJSAlt;
  }

  let configPath = customConfigPath
    ? path.resolve(customConfigPath)
    : path.join(__dirname, defaultConfigJS);
  // console.log(configPath);
  let configInfo;
  let hasCustomConfig = true;
  let checkMsg = '';

  try {
    fs.statSync(configPath);
  } catch (e) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      configPath = autoCreateConfigFile();
    } else {
      hasCustomConfig = false;
    }
  }

  // console.log('process.env.STATIC_PREFIX: ', process.env.STATIC_PREFIX);
  // console.log('process.env.APP_PREFIX: ', process.env.APP_PREFIX);

  if (hasCustomConfig) {
    configInfo = require(configPath);
    checkMsg += `Using [${chalk.green(configPath)}] as app configuration`;
  } else {
    configInfo =
      !nodeBuildEnv || nodeBuildEnv !== 'development' ? prodConfig : devConfig;
    checkMsg += `Using [${chalk.green(
      !nodeBuildEnv ? 'config.default.prod' : 'config.default.dev'
    )}] as app configuration`;
  }
  console.log(checkMsg);

  if (customConfig) {
    console.log('merging custom config into basic config from config file...');
    Object.assign(configInfo, customConfig);
  }

  //cache non-empty config from env at init time instead of accessing from process.env at runtime to improve performance
  for (let key in configInfo) {
    if (configInfo.hasOwnProperty(key)) {
      config[key] = process.env.hasOwnProperty(key)
        ? process.env[key]
        : configInfo[key];
    }
  }
}

function autoCreateConfigFile() {
  const targetFile = path.join(__dirname, `../${DEFAULT_CONFIG_FILE_NAME}`);
  fs.copyFileSync(path.join(__dirname, 'app-config.js.sample'), targetFile);
  console.log(`Create ${DEFAULT_CONFIG_FILE_NAME} in project root`);
  return targetFile;
}

function getConfigProperty(key) {
  let value;
  if (config.hasOwnProperty(key)) {
    // console.log(`config[${key}] from cache`);
    value = config[key];
  } else {
    // console.log(`config[${key}] from process.env`);
    value = process.env[key];
  }
  return value;
}

// console.log('config: ', config);

initConfig();

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
    return getConfigProperty('APP_PREFIX') || '';
  },
  getStaticPrefix: () => {
    return getConfigProperty('STATIC_PREFIX') || '';
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
  isSSREnabled: () => {
    const val = getConfigProperty('ENABLE_SSR');
    return isTrue(val) && !module.exports.isHMREnabled();
  },
  isBundleAnalyzerEnabled: () => {
    const val = getConfigProperty('BUNDLE_ANALYZER');
    return isTrue(val);
  },
  isCustomAPIPrefix: () => {
    return !!getConfigProperty('CUSTOM_API_PREFIX');
  },
  getLogPath: () => {
    return getConfigProperty('LOG_PATH') || path.join(__dirname, '../logs');
  },
  getHttpProxy: () => {
    return getConfigProperty('HTTP_PROXY');
  },
  getSocksProxy: () => {
    return getConfigProperty('SOCKS_PROXY');
  },
  getDefaultApiEndPoint: () => {
    const obj = getConfigProperty('API_ENDPOINTS');
    return obj[obj[DEFAULT_PREFIX_KEY]];
  },
  getDefaultApiEndPointKey: () => {
    return DEFAULT_PREFIX_KEY;
  },
  isInlineStyles: () => {
    return getConfigProperty('INLINE_STYLES');
  },
  isCSSModules: () => {
    return isTrue(getConfigProperty('CSS_MODULES'));
  },
  getHMRPort: () => {
    return getConfigProperty('HMR_PORT');
  },
  getOutputDir: () => {
    return getConfigProperty('OUTPUT_DIR') || 'build/app/';
  },
  isServingStaticIndex: () => {
    return isTrue(getConfigProperty('SERVE_STATIC_INDEX'));
  },
  getEnv: key => {
    return getConfigProperty(key);
  },
};

function isTrue(val) {
  return !!(val && (val === true || val === 'true' || val === '1'));
}
