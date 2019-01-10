const app = require('./app');

/**
 * Initialize koa app and start server
 */
(async () => {
  app.listen(await app.create());
})();
