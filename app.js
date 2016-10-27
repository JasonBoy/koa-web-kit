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

const config = require('./config');
const logger = require('./mw/logger');
const index = require('./routes/index');
const user = require('./routes/user');

const PORT = config.getListeningPort();
const DEV_MODE = config.isDevMode();

//and initialize it with
const app = koa();

app.use(koaLogger());
// app.use(compress());
app.use(mount('/public', serveStatic(path.join(process.cwd(), 'build', 'app'), {
  maxage: DEV_MODE ? 0 : 2592000000 // one month cache for prod
})));

app.keys = ['app'];
app.proxy = true;
app.use(session(app));
app.use(bodyParser());

var viewsPath = path.join(process.cwd(), 'build/app');
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
app.use(user.routes());

//and then give it a port to listen for
app.listen(PORT);
logger.info(`Koa listening on port ${PORT}`);