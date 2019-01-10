const supertest = require('supertest');
const cheerio = require('cheerio');
const app = require('../../app');
let requestHandler;
beforeAll(async () => {
  const koaApp = await app.initialize();
  requestHandler = koaApp.callback();
});

/*afterAll(done => {
  server.close(done);
});*/

describe('normal routes', () => {
  test('get home page', async () => {
    const response = await supertest(requestHandler).get('/');
    const $ = cheerio.load(response.text);
    expect(response.status).toEqual(200);
    expect(response.header['cache-control']).toBe('no-cache');
    expect($('#app').length).toBe(1);
  });

  /*test('get github branches', async () => {
    const response = await supertest(requestHandler).get('/github');
    const $ = cheerio.load(response.text);
    const branches = $('#app .github-wrapper > ul > li');
    console.log('branches.length: ', branches.length);
    expect(branches.length).toBeGreaterThan(0);
  });*/
});
