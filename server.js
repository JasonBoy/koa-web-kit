const path = require('path');

const koa = require('koa');
const mount = require('koa-mount');
const compress = require('koa-compress');
const session = require('koa-session');
const views = require('koa-views');
//and initialize it with
const app = koa();
const bodyParser = require('koa-bodyparser');
const serveStatic = require('koa-static');
const cons = require('consolidate');
const nunjucks = require('nunjucks');

const index = require('./routes/index');
const user = require('./routes/user');

// app.use(compress());
// app.use(mount('/public', serveStatic(path.join(process.cwd(), 'public'))));
app.use(mount('/public', serveStatic(path.join(process.cwd(), 'build', 'app'))));

app.use(function *(next) {
  console.log('path: %s', this.path);
  yield next;
});
app.keys = ['app'];
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
const port = process.env.PORT || 3000;
app.listen(port);
console.log('Koa listening on port %d', port);