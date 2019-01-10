const path = require('path');
const supertest = require('supertest');
const cheerio = require('cheerio');
const app = require('../../app');
// let requestHandler;
let server;
beforeAll(async () => {
  const koaApp = await app.initialize();
  // requestHandler = koaApp.callback();
  server = supertest.agent(app.listen(koaApp));
});

/*afterAll(done => {
  // console.log('server.app: ', server.app);
  server.app.close(done);
});*/

describe('normal routes', () => {
  test('get home page', async () => {
    // const response = await supertest(requestHandler).get('/');
    const response = await server.get('/');
    const $ = cheerio.load(response.text);
    expect(response.status).toEqual(200);
    expect(response.header['cache-control']).toBe('no-cache');
    expect($('#app').length).toBe(1);
  });

  test('multipart upload', async () => {
    const response = await server
      .post('/upload')
      .attach('image', path.join(__dirname, '../../src/assets/static/logo.svg'))
      .field({
        name: 'jason',
      });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('body.name');
    expect(response.body).toHaveProperty('files.image');
  });

  /*test('get github branches', async () => {
    // const response = await supertest(requestHandler).get('/github');
    const response = await server.get('/github');
    const $ = cheerio.load(response.text);
    const branches = $('#app .github-wrapper > ul > li');
    // console.log('branches.length: ', branches.length);
    expect(branches.length).toBeGreaterThan(0);
  });*/
});

describe('request proxy for koa', () => {});
