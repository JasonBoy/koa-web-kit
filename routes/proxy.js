/**
 * Request proxy for backend api
 */

const Router = require('koa-router');

const { Proxy } = require('../api/api-proxy');

exports.handleApiRequests = function(prefix, endPoint) {
  // TODO: a path rewrite?
  const router = new Router({ prefix });
  const apiProxy = new Proxy({ endPoint, prefix });
  router.all('*', ctx => {
    ctx.body = apiProxy.proxyRequest(ctx);
  });
  return router.routes();
};
