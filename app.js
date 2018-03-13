'use strict';

const config = require('./config/env');

const path = require('path');
const Koa = require('koa');
const mount = require('koa-mount');
const compress = require('koa-compress');
const session = require('koa-session');
const views = require('koa-views');
const morgan = require('koa-morgan');
const serveStatic = require('koa-static');
const convert = require('koa-convert');
const helmet = require('koa-helmet');
const cons = require('consolidate');
const nunjucks = require('nunjucks');
const _ = require('lodash');

const logger = require('./mw/logger');
const index = require('./routes/index');
const apiRouter = require('./routes/proxy');
const sysUtils = require('./config/utils');

const PORT = config.getListeningPort();
const DEV_MODE = config.isDevMode();
const DEFAULT_PREFIX_KEY = 'defaultPrefix';
const API_ENDPOINTS = config.getApiEndPoints();
const isHMREnabled = config.isHMREnabled();

//and initialize it with
const app = new Koa();
app.env = config.getNodeEnv() || 'development';
app.keys = ['koa-web-kit'];
app.proxy = true;

app.use(morgan(DEV_MODE ? 'dev' : 'tiny'));
app.use(helmet());

(async function() {
  initProxy();
  await initHMR();
  initApp();
  logger.info(`${isHMREnabled ? 'HMR & ' : ''}Koa App initialized!`);
})();

function initApp() {
  if (!DEV_MODE) {
    app.use(compress());
  }

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

  const viewsPath = path.join(process.cwd(), 'build/app');
  cons.requires.nunjucks = nunjucks.configure(viewsPath, {
    autoescape: true,
    noCache: DEV_MODE,
    tags: {
      variableStart: '{=',
      variableEnd: '=}',
    },
  });

  app.use(
    views(viewsPath, {
      map: {
        html: 'nunjucks',
      },
    })
  );

  app.use(index.routes());

  app.on('error', err => {
    logger.error(err);
  });

  //and then give it a port to listen for
  app.listen(PORT, '0.0.0.0');
  logger.info(`Koa listening on port ${PORT}`);
}

async function initHMR() {
  let HMRInitialized = false;
  //enable hmr
  if (isHMREnabled) {
    logger.info('HMR enabled, initializing HMR...');
    const hmrMiddleware = require('koa-webpack');
    const historyApiFallback = require('koa-history-api-fallback');
    const getPort = require('get-port');
    const webpack = require('webpack');
    const DashboardPlugin = require('webpack-dashboard/plugin');
    const availPort = await getPort();
    const webpackConfig = require('./config/webpack.config.dev');
    const compiler = webpack(
      Object.assign({}, webpackConfig, {
        stats: {
          modules: false,
          colors: true,
        },
      })
    );
    compiler.apply(new DashboardPlugin());
    const instance = hmrMiddleware({
      compiler,
      // config: webpackConfig,
      hot: {
        port: availPort,
        // logLevel: 'warn',
        hot: true,
        reload: true,
      },
      dev: {
        // logLevel: 'warn',
        index: 'index.html',
        publicPath: webpackConfig.output.publicPath,
        watchOptions: {
          aggregateTimeout: 0,
        },
        hot: true,
        stats: {
          modules: false,
          colors: true,
        },
      },
    });
    const dev = instance.dev;
    await new Promise((resolve, reject) => {
      dev.waitUntilValid(() => {
        if (!HMRInitialized) {
          HMRInitialized = true;
          app.use(instance);
          app.use(convert(historyApiFallback()));
          app.use(instance);
        }
        resolve();
      });
    });
    // console.log(webpackConfig);
    // app.use();
  }
}

function initProxy() {
  //api proxy
  if (config.isNodeProxyEnabled() && !_.isEmpty(API_ENDPOINTS)) {
    for (const prefix in API_ENDPOINTS) {
      if (
        API_ENDPOINTS.hasOwnProperty(prefix) &&
        prefix !== DEFAULT_PREFIX_KEY
      ) {
        let endPoint = API_ENDPOINTS[prefix];
        if ('string' !== typeof endPoint) {
          endPoint = endPoint.endpoint;
        }
        app.use(apiRouter.handleApiRequests(prefix, endPoint));
        logger.info('Node proxy[' + endPoint + '] enabled for path: ' + prefix);
      }
    }
  }
}
