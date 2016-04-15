const path = require('path');

const koa = require('koa');
const mount = require('koa-mount');
const compress = require('koa-compress');
const session = require('koa-session');
//and initialize it with
const app = koa();
const bodyParser = require('koa-bodyparser');
const serveStatic = require('koa-static');

var index = require('./routes/index');
var user = require('./routes/user');

// app.use(compress());
app.use(mount('/public', serveStatic(path.join(process.cwd(), 'public'))));

app.use(function *(next) {
  console.log('path: %s', this.path);
  yield next;
});
app.keys = ['app'];
app.use(session(app));
app.use(bodyParser());
app.use(index.routes());
app.use(user.routes());

//and then give it a port to listen for
app.listen(3001);
console.log('Koa listening on port 3001');