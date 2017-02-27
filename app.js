'use strict';

const path = require('path');
const koa = require('koa');
const mount = require('koa-mount');
const compress = require('koa-compress');
const session = require('koa-session');
const views = require('koa-views');
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const serveStatic = require('koa-static');
const cons = require('consolidate');
const nunjucks = require('nunjucks');
const _ = require('lodash');

const config = require('./config');
const logger = require('./mw/logger');
const index = require('./routes/index');
const apiRouter = require('./routes/proxy');

const PORT = config.getListeningPort();
const DEV_MODE = config.isDevMode();
const DEFAULT_PREFIX_KEY = 'defaultPrefix';
const API_ENDPOINTS = config.getApiEndPoints();

//and initialize it with
const app = koa();
app.env = config.getNodeEnv() || 'development';
app.keys = ['koa-web-kit'];
app.proxy = true;

app.use(koaLogger());
app.use(compress());
app.use(mount('/public', serveStatic(path.join(process.cwd(), 'build', 'app'), {
  maxage: DEV_MODE ? 0 : 2592000000 // one month cache for prod
})));

//api proxy
if(config.isNodeProxyEnabled() && !_.isEmpty(API_ENDPOINTS)) {
  for(const prefix in API_ENDPOINTS) {
    if(API_ENDPOINTS.hasOwnProperty(prefix) && prefix !== DEFAULT_PREFIX_KEY) {
      let endPoint = API_ENDPOINTS[prefix];
      if ('string' !== typeof endPoint) {
        endPoint = endPoint.endpoint;
      }
      app.use(apiRouter.handleApiRequests(prefix, endPoint));
      logger.info('Node proxy[' + endPoint + '] enabled for path: ' + prefix);
    }
  }
}


app.use(session(app));
app.use(bodyParser());

const viewsPath = path.join(process.cwd(), 'build/app');
cons.requires.nunjucks = nunjucks.configure(viewsPath, {
  autoescape: true,
  noCache: true,
  tags: {
    variableStart: '{=',
    variableEnd: '=}'
  }
});

app.use(views(viewsPath, {
  map: {
    html: 'nunjucks'
  }
}));
app.use(index.routes());

app.on('error', err => {
  logger.error(err);
});

//and then give it a port to listen for
app.listen(PORT);
logger.info(`Koa listening on port ${PORT}`);