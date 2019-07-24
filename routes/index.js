'use strict';
const Router = require('koa-router');
const koaBody = require('koa-body');
const got = require('got');
const ServerRenderer = require('../services/ServerRenderer');

const renderer = new ServerRenderer({
  stream: false,
  // flushInterval: 1000 * 30, //flush every 30s
});

const config = require('../config/env');
const utils = require('../config/utils');
const { logger } = require('../services/logger');

const appPrefix = utils.normalizeTailSlash(config.getAppPrefix());

const router = new Router({
  prefix: appPrefix,
});

router.use(async function(ctx, next) {
  // console.log(`start of index router: ${ctx.path}`);
  ctx.set('Cache-Control', 'no-cache');
  ctx.state = {
    initialData: {},
  };
  await next();
  // console.log(`end of index router: ${ctx.path}`);
});

/**
 * File upload demo
 */
router.post(
  '/upload',
  koaBody({
    multipart: true,
    keepExtensions: true,
  }),
  async function(ctx) {
    const { body, files } = ctx.request;
    ctx.body = { body, files };
  }
);

/**
 * Async request data for initial state demo
 */

router.get('/400', async ctx => {
  ctx.status = 400;
  ctx.body = {
    msg: '400',
  };
});

router.post('/400', koaBody(), async ctx => {
  ctx.status = 400;
  ctx.set('cache-control', 'no-store');
  ctx.body = {
    msg: '400',
    data: ctx.request.body,
  };
});

router.get('/500', async ctx => {
  ctx.throw(500);
});

/**
 * Other default handler
 */
router.get('*', async function(ctx) {
  renderer.render(ctx);
});

module.exports = router;
