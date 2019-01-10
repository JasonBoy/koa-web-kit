const config = require('../../config/env');
const path = require('path');
const supertest = require('supertest');
const cheerio = require('cheerio');
const app = require('../../app');
const { startJSONServer, XAccessToken } = require('../../mocks/server');
const endPoints = config.getApiEndPoints('API_ENDPOINTS');
const defaultEndpointKey = config.getDefaultApiEndPointKey();
const defaultPrefix = endPoints[defaultEndpointKey];

console.log('endPoints: ', endPoints);

describe('normal routes', () => {
  let server;
  beforeAll(async () => {
    const koaApp = await app.create();
    // server = supertest(koaApp.callback());
    // server = supertest.agent(app.listen(koaApp));
    server = supertest.agent(koaApp.callback());
  });

  /*afterAll(async () => {
    await wait(500);
    return new Promise((resolve) => {
      server.app.close(() => {
        console.log('server closed');
        resolve();
      });
    });
  });*/

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

describe('request proxying', () => {
  let server;
  let server2;
  let jsonServer;
  const profileUrl = `${defaultPrefix}/profile`;
  const newPostId = String(Date.now());
  beforeAll(async () => {
    jsonServer = await startJSONServer();
    const apps = await Promise.all([app.create(), app.create()]);
    server = supertest.agent(apps[0].callback());
    server2 = supertest.agent(app.listen(apps[1], 3002));
  });

  /*afterAll(done => {
    console.log('closing jsonServer...');
    jsonServer.close(() => {
      console.log('close jsonServer done');
      done();
    });
  });*/

  test('check passed headers and returned headers', async () => {
    const response = await server
      .get(profileUrl)
      .set(XAccessToken, 'some_token');
    // console.log('response.header: ', response.header);
    expect(response.header).toHaveProperty(
      `${XAccessToken}-back`,
      'some_token'
    );
    expect(response.header).toHaveProperty('x-powered-by', 'Express');
  });

  test('get profile', async () => {
    const response = await server.get(profileUrl);
    // console.log('response.body: ', response.body);
    // console.log('response.header: ', response.header);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('name', 'jason');
  });

  test('get posts', async () => {
    const response = await server
      .get(`${defaultPrefix}/posts`)
      .query({ id: 1 });
    expect(response.body.length).toEqual(1);
    expect(response.body[0]).toHaveProperty('id', 1);
  });

  test('post a post', async () => {
    const response = await server.post(`${defaultPrefix}/posts`).send({
      id: newPostId,
      title: `koa-json-server_${Date.now()}`,
      author: 'jason2',
    });
    const response2 = await server
      .get(`${defaultPrefix}/posts`)
      .query({ id: newPostId });
    expect(response.status).toEqual(201);
    expect(response.ok).toEqual(true);
    expect(response2.body[0]).toHaveProperty('id', newPostId);
  });
  test('put a post', async () => {
    const response = await server
      .put(`${defaultPrefix}/posts/${newPostId}`)
      .send({
        title: `json-server_${Date.now()}`,
        author: 'jason',
      });
    const response2 = await server
      .get(`${defaultPrefix}/posts`)
      .query({ id: newPostId });
    expect(response.ok).toEqual(true);
    expect(response2.body[0]).toHaveProperty('author', 'jason');
  });
  test('patch a post', async () => {
    const response = await server
      .patch(`${defaultPrefix}/posts/${newPostId}`)
      .send({
        author: 'jason2',
      });
    const response2 = await server
      .get(`${defaultPrefix}/posts`)
      .query({ id: newPostId });
    expect(response.ok).toEqual(true);
    expect(response2.body[0]).toHaveProperty('author', 'jason2');
  });
  test('delete a post', async () => {
    const response = await server.delete(`${defaultPrefix}/posts/${newPostId}`);
    const response2 = await server
      .get(`${defaultPrefix}/posts`)
      .query({ id: newPostId });
    expect(response.ok).toEqual(true);
    expect(response2.body).toHaveLength(0);
  });

  /**
   * app-config.js config:
   * API_ENDPOINTS: {
      defaultPrefix: '/api-proxy',
      '/api-proxy': 'http://127.0.0.1:3001',
      '/proxy2': 'http://127.0.0.1:3002',
    },
   */
  test('upload proxying', async () => {
    const response = await server
      .post('/proxy2/upload')
      .attach('image', path.join(__dirname, '../../src/assets/static/logo.svg'))
      .field({
        name: 'jason',
      });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('body.name');
    expect(response.body).toHaveProperty('files.image');
  });
});
