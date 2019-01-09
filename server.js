const app = require('./app');

(async () => {
  app.listen(await app.initialize());
})();
