/**
 * Request proxy for backend api
 */

const Router = require('koa-router');

const { HttpClient } = require('../services/HttpClient');

exports.handleApiRequests = function(prefix, endPoint) {
  const routerPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  // TODO: a path rewrite?
  const router = new Router({ prefix: routerPrefix });
  const apiProxy = new HttpClient({ endPoint, prefix });
  router.all('*', ctx => {
    ctx.body = apiProxy.proxyRequest(ctx);
  });
  return router.routes();
};
