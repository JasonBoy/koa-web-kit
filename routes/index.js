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

module.exports = router;



