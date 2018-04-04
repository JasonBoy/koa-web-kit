'use strict';

const Router = require('koa-router');
const koaBody = require('koa-body');
const config = require('../config/env');
const utils = require('../config/utils');
const appPrefix = utils.normalizeTailSlash(config.getAppPrefix());

const router = new Router({
  prefix: appPrefix,
});

router.use(async function(ctx, next) {
  // console.log(`start of index router: ${ctx.path}`);
  await next();
  // console.log(`end of index router: ${ctx.path}`);
});

router.post('/user', koaBody({ multipart: true }), async function(ctx) {
  const body = ctx.request.body;
  console.log(body);
  ctx.body = { result: body };
});

router.get('*', async function(ctx) {
  await ctx.render('index');
});

module.exports = router;
