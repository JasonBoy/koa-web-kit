/**
 * Request proxy for backend api
 */

const Router = require('koa-router');

const apiProxy = require('../api/api-proxy');

module.exports = {
  handleApiRequests
};

function handleApiRequests(prefix, apiEndpoint) {
  const router = new Router({prefix: prefix});
  router.all('*', function *() {
    yield apiProxy.coRequest.call(this, apiEndpoint);
  });
  return router.routes();
}