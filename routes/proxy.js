/**
 * Request proxy for backend api
 */

const { PassThrough } = require('stream');
const Router = require('koa-router');

const { HttpClient } = require('../services/HttpClient');

exports.handleApiRequests = function(prefix, endPoint) {
  const routerPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  // TODO: a path rewrite?
  const router = new Router({ prefix: routerPrefix });
  const apiProxy = new HttpClient({ endPoint, prefix });
  router.all('*', async ctx => {
    const requestStream = apiProxy.proxyRequest(ctx);
    const pt = requestStream.pipe(PassThrough());
    await new Promise(resolve => {
      requestStream.on('response', response => {
        ctx.status = response.statusCode;
        ctx.set(response.headers);
        resolve();
      });
    });
    ctx.body = pt;
  });
  return router.routes();
};
