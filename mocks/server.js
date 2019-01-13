/**
 * A fake JSON Server for testing restful api
 * @type {module:path}
 */

const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, './db.json'));
const middlewares = jsonServer.defaults();

const XAccessToken = 'x-access-token';

server.use(middlewares);

//send x-access-token header back
server.use((req, res, next) => {
  res.set({
    [`${XAccessToken}-back`]: req.get(XAccessToken),
  });
  next();
});

server.use(router);

module.exports = {
  XAccessToken,
  startJSONServer(port) {
    return new Promise(resolve => {
      server.listen(port, () => {
        console.log(`JSON Server is running on ${port}`);
        resolve(server);
      });
    });
  },
};
