'use strict';

const config = require('./config/env');

const path = require('path');
const Koa = require('koa');
const mount = require('koa-mount');
const compress = require('koa-compress');
const session = require('koa-session');
const serveStatic = require('koa-static');
const convert = require('koa-convert');
const helmet = require('koa-helmet');
const favicon = require('koa-favicon');
const isEmpty = require('lodash.isempty');

const { logger, Logger } = require('./services/logger');
const index = require('./routes/index');
const { handleApiRequests } = require('./routes/proxy');
const sysUtils = require('./config/utils');
// const isSSREnabled = config.isSSREnabled();

const PORT = config.getListeningPort();
const DEV_MODE = config.isDevMode();
const DEFAULT_PREFIX_KEY = 'defaultPrefix';
const API_ENDPOINTS = config.getApiEndPoints();
const isHMREnabled = config.isHMREnabled();

function initAppCommon() {
  const app = new Koa();
  app.env = config.getNodeEnv() || 'development';
  app.keys = ['koa-web-kit'];
  app.proxy = true;

  app.use(Logger.createMorganLogger());
  app.use(logger.createRequestsLogger());
  app.use(helmet());
  return app;
}

function initApp(app) {
  if (!DEV_MODE) {
    app.use(compress());
  }

  app.use(favicon(__dirname + '/src/assets/static/favicon.ico'));

  let staticPrefix = path.join(
    config.getAppPrefix(),
    config.getStaticPrefix() || '/'
  );
  if (sysUtils.isWindows()) {
    staticPrefix = sysUtils.replaceBackwardSlash(staticPrefix);
  }
  app.use(
    mount(
      staticPrefix,
      serveStatic(path.join(process.cwd(), 'build/app'), {
        // one month cache for prod
        maxage: DEV_MODE ? 0 : 2592000000,
        gzip: false,
      })
    )
  );

  app.use(session(app));

  app.use(index.routes());

  app.on('error', err => {
    logger.error(err.stack);
  });

  return app;
}

function listen(app, port = PORT) {
  const server = app.listen(port, '0.0.0.0');
  logger.info(`Koa listening on port ${port}`);
  if (DEV_MODE) {
    logger.info(`visit: http://localhost:${port}`);
  }
  return server;
}

//React SSR
async function initSSR() {}

async function initHMR(app) {
  if (!isHMREnabled) return;
  let HMRInitialized = false;
  logger.info('HMR enabled, initializing HMR...');
  const koaWebpack = require('koa-webpack');
  const historyApiFallback = require('koa-history-api-fallback');
  const webpack = require('webpack');
  const webpackConfig = require('./config/webpack.config.dev');
  const compiler = webpack(
    Object.assign({}, webpackConfig, {
      stats: {
        modules: false,
        colors: true,
      },
    })
  );
  return new Promise((resolve, reject) => {
    koaWebpack({
      compiler,
      hotClient: {
        port: 0,
        logLevel: 'error',
        hmr: true,
        reload: true,
      },
      devMiddleware: {
        index: 'index.html',
        publicPath: webpackConfig.output.publicPath,
        watchOptions: {
          aggregateTimeout: 0,
        },
        writeToDisk: true,
        stats: {
          modules: false,
          colors: true,
          children: false,
        },
      },
    })
      .then(middleware => {
        if (!HMRInitialized) {
          HMRInitialized = true;
          app.use(convert(historyApiFallback()));
          app.use(middleware);
          middleware.devMiddleware.waitUntilValid(resolve);
        }
      })
      .catch(err => {
        logger.error('[koa-webpack]:', err);
        reject();
      });
  });
}

function initProxy(app) {
  //api proxy
  if (config.isNodeProxyEnabled() && !isEmpty(API_ENDPOINTS)) {
    for (const prefix in API_ENDPOINTS) {
      if (
        API_ENDPOINTS.hasOwnProperty(prefix) &&
        prefix !== DEFAULT_PREFIX_KEY
      ) {
        let endPoint = API_ENDPOINTS[prefix];
        if ('string' !== typeof endPoint) {
          endPoint = endPoint.endpoint;
        }
        app.use(handleApiRequests(prefix, endPoint));
        logger.info('Node proxy[' + endPoint + '] enabled for path: ' + prefix);
      }
    }
  }
}

module.exports = {
  listen,
  /**
   *
   * @return {Promise<Koa>}
   */
  create: async function() {
    const app = initAppCommon();
    initProxy(app);
    await initSSR();
    await initHMR(app);
    initApp(app);
    return Promise.resolve(app);
    // logger.info(`${isHMREnabled ? 'HMR & ' : ''}Koa App initialized!`);
  },
};
