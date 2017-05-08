'use strict';

const Router = require('koa-router');
const config = require('../config/env');
const utils = require('../config/utils');
const appPrefix = utils.normalizeTailSlash(config.getAppPrefix());

const router = new Router({
  prefix: appPrefix,
});


router.use(async function (ctx, next) {
  // console.log(`start of index router: ${ctx.path}`);
  await next();
  // console.log(`end of index router: ${ctx.path}`);
});

router.get('/', async function (ctx) {
  ctx.state = {
    title: 'using nunjucks template'
  };

  await ctx.render('index');
});

router.get('/market/mall', function (ctx) {
  console.log('in mall');
  logRequestInfo(ctx);
  ctx.body = 'Mall';
});

router.get('/user/:id', function (ctx) {
  console.log('user id:', ctx.params.id);
  ctx.body = ctx.params.id;
});

router.post('/login', function (ctx) {
  console.log('body:(buffer or text):', ctx.request.body);    // if buffer or text
  console.log('files: (multipart or urlencoded):', ctx.request.files);   // if multipart or urlencoded
  console.log('field: (json):', ctx.request.fields);  // if json
  ctx.body = ctx.request.fields;
});

router.get('/session', function (ctx) {
  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
  ctx.body = n + ' views';
});

function logRequestInfo(ctx) {
  console.log(typeof ctx.query, ctx.query);
  console.log('method: %s', ctx.method);
  console.log('url: %s', ctx.url);
  console.log('original url: %s', ctx.originalUrl);
  console.log('path: %s', ctx.path);
  console.log('query: %s', JSON.stringify(ctx.query));
  console.log('host: %s', ctx.host);
  console.log('hostname: %s', ctx.hostname);
}

module.exports = router;



