'use strict';

const config = require('./config/env');

const path = require('path');
const Koa = require('koa');
const mount = require('koa-mount');
const compress = require('koa-compress');
const session = require('koa-session');
const serveStatic = require('koa-static');
const helmet = require('koa-helmet');
const favicon = require('koa-favicon');
const isEmpty = require('lodash.isempty');
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');

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
const servingStaticIndex = config.isServingStaticIndex();

function initAppCommon() {
  const app = new Koa();
  app.env = config.getNodeEnv() || 'development';
  app.keys = ['koa-web-kit'];
  app.proxy = true;

  app.use(Logger.createMorganLogger());
  app.use(logger.createRequestsLogger());
  // app.use(helmet());
  app.use(helmet.xssFilter());
  return app;
}

function initApp(app) {
  app.use(conditional());
  app.use(etag());
  if (!DEV_MODE) {
    app.use(compress());
  }

  app.use(favicon(path.join(__dirname, 'build/app/favicon.ico')));

  // =====serve static=====
  const ROOT_PATH = '/';
  let staticPrefixConfig = config.getStaticPrefix();
  let staticPrefix = path.join(config.getAppPrefix(), staticPrefixConfig);
  if (!staticPrefix.startsWith(ROOT_PATH)) {
    staticPrefix = ROOT_PATH;
  }

  if (sysUtils.isWindows()) {
    staticPrefix = sysUtils.replaceBackwardSlash(staticPrefix);
  }

  const staticOptions = {
    // one month cache for prod
    maxage: DEV_MODE ? 0 : 2592000000,
    gzip: false,
    setHeaders(res, path) {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  };
  const isStaticAssetsInRoot =
    !staticPrefixConfig || staticPrefixConfig === ROOT_PATH;
  if (isStaticAssetsInRoot && !servingStaticIndex) {
    //workaround: use a random index to pass through the static middleware
    staticOptions.index = `${Math.random().toString()}.html`;
  }

  app.use(
    mount(
      staticPrefix,
      serveStatic(path.join(__dirname, 'build/app'), staticOptions),
    ),
  );
  // handle static not found, do not pass further down
  if (!isStaticAssetsInRoot) {
    app.use(
      mount(staticPrefix, (ctx) => {
        ctx.status = 404;
        ctx.body = 'Not Found';
      }),
    );
  }
  // =====serve static end=====

  app.use(session(app));

  app.use(index.routes());

  app.on('error', (err) => {
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
  const hmrPort = config.getHMRPort();
  const webpackConfig = require('./config/webpack.config.dev');
  const compiler = webpack(
    Object.assign({}, webpackConfig, {
      stats: {
        modules: false,
        colors: true,
      },
    }),
  );
  const hotClient = {
    logLevel: 'error',
    hmr: true,
    reload: true,
    host: {
      client: 'localhost',
      server: '0.0.0.0',
    },
  };
  if (hmrPort) {
    hotClient.port = parseInt(hmrPort);
  }
  return new Promise((resolve, reject) => {
    koaWebpack({
      compiler,
      hotClient,
      devMiddleware: {
        index: 'index.html',
        publicPath: webpackConfig.output.publicPath,
        watchOptions: {
          aggregateTimeout: 0,
        },
        writeToDisk: false,
        stats: {
          modules: false,
          colors: true,
          children: false,
        },
      },
    })
      .then((middleware) => {
        if (!HMRInitialized) {
          HMRInitialized = true;
          app.use(historyApiFallback());
          app.use(middleware);
          middleware.devMiddleware.waitUntilValid(resolve);
        }
      })
      .catch((err) => {
        logger.error('[koa-webpack]:', err);
        reject();
      });
  });
}

function initProxy(app) {
  //api proxy
  if (!(config.isNodeProxyEnabled() && !isEmpty(API_ENDPOINTS))) {
    return;
  }
  if ('string' === typeof API_ENDPOINTS) {
    const defaultPrefix = config.getDefaultApiEndPointPrefix();
    app.use(handleApiRequests(defaultPrefix, API_ENDPOINTS));
    logProxyInfo(API_ENDPOINTS, defaultPrefix);
    return;
  }
  for (const prefix in API_ENDPOINTS) {
    if (API_ENDPOINTS.hasOwnProperty(prefix) && prefix !== DEFAULT_PREFIX_KEY) {
      let endPoint = API_ENDPOINTS[prefix];
      if ('string' !== typeof endPoint) {
        endPoint = endPoint.endpoint;
      }
      app.use(handleApiRequests(prefix, endPoint));
      logProxyInfo(endPoint, prefix);
    }
  }

  function logProxyInfo(endPoint, prefix) {
    logger.info('Node proxy[' + endPoint + '] enabled for path: ' + prefix);
  }
}

module.exports = {
  listen,
  /**
   *
   * @return {Promise<Koa>}
   */
  create: async function () {
    const app = initAppCommon();
    initProxy(app);
    await initSSR();
    await initHMR(app);
    initApp(app);
    return Promise.resolve(app);
    // logger.info(`${isHMREnabled ? 'HMR & ' : ''}Koa App initialized!`);
  },
};
