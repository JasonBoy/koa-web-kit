/**
 * Request proxy for backend api
 */

const Router = require('koa-router');

const { APIProxy } = require('../api/api-proxy');

module.exports = {
  handleApiRequests,
};

function handleApiRequests(prefix, endPoint) {
  const router = new Router({ prefix });
  const proxy = new APIProxy({ endPoint, prefix });
  router.all('*', async function(ctx) {
    proxy.proxyRequest(ctx);
  });
  return router.routes();
}
