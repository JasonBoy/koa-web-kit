'use strict';

const Router = require('koa-router');
const koaBody = require('koa-body');
const request = require('request');
const config = require('../config/env');
const utils = require('../config/utils');
const SSR = require('../build/node/ssr');

const isSSREnabled = config.isSSREnabled();
const appPrefix = utils.normalizeTailSlash(config.getAppPrefix());

const s = new SSR();

const router = new Router({
  prefix: appPrefix,
});

const emptyInitialData = JSON.stringify({});

router.use(async function(ctx, next) {
  // console.log(`start of index router: ${ctx.path}`);
  ctx.state = {
    initialData: emptyInitialData,
  };
  await next();
  // console.log(`end of index router: ${ctx.path}`);
});

router.post('/user', koaBody({ multipart: true }), async function(ctx) {
  const body = ctx.request.body;
  console.log(body);
  ctx.body = { result: body };
});

router.get('/github', async function(ctx) {
  if (!isSSREnabled) {
    await ctx.render('index');
    return;
  }
  //use isomorphic-fetch to share the fetch logic
  const ret = await new Promise((resole, reject) => {
    request(
      'https://api.github.com/repos/jasonboy/wechat-jssdk/branches',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
        json: true,
      },
      (error, response, body) => {
        if (error) {
          console.log('error:', error); // Print the error if one occurred
          reject(error);
        }
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        resole(body);
      }
    );
  });

  const data = { github: ret };

  const rendered = s.renderGithub(ctx.url, data);
  console.log(rendered);
  ctx.state = {
    SSRHtml: rendered.html,
    bundleScripts: rendered.scripts,
    initialData: JSON.stringify(data),
  };
  await ctx.render('index');
});

router.get('*', async function(ctx) {
  if (!isSSREnabled) {
    await ctx.render('index');
    return;
  }

  const rendered = s.renderHome(ctx.url);
  console.log(rendered);
  ctx.state = {
    SSRHtml: rendered.html,
    bundleScripts: rendered.scripts,
    initialData: ctx.state.initialData,
  };
  await ctx.render('index');
});

// router.get('*', async function(ctx) {
//   await ctx.render('index');
// });

module.exports = router;
