const nock = require('nock');
const { HttpClient } = require('../../services/HttpClient');

const TEST_DOMAIN = 'http://localhost';

describe('HttpClient verbs', () => {
  let client;
  let scope;

  beforeAll(() => {
    scope = nock(TEST_DOMAIN)
      .get('/')
      .reply(200, { name: 'jason' })
      .post('/user', body => body.name == 'jason')
      .reply(200, { method: 'post', name: 'jason' })
      .put('/user/xxx', body => body.name == 'jason2')
      .reply(200, { method: 'put', name: 'jason2' })
      .patch('/user/xxx', body => body.name == 'jason2')
      .reply(200, { method: 'patch', name: 'jason2' })
      .delete('/user/xxx')
      .reply(200, { method: 'delete' });
    client = new HttpClient(
      {
        endPoint: '',
      },
      {
        throwHttpErrors: true,
        json: true,
      }
    );
  });

  afterAll(() => {
    scope.cleanAll();
    scope.restore();
  });

  test('http get', async () => {
    const data = await client.get(`${TEST_DOMAIN}/`);
    expect(data.name).toBe('jason');
  });

  test('http post', async () => {
    const data = await client.post(`${TEST_DOMAIN}/user`, { name: 'jason' });
    expect(data).toEqual({ method: 'post', name: 'jason' });
  });

  test('http put', async () => {
    const data = await client.put(`${TEST_DOMAIN}/user/xxx`, {
      name: 'jason2',
    });
    expect(data).toEqual({ method: 'put', name: 'jason2' });
  });

  test('http patch', async () => {
    const data = await client.patch(`${TEST_DOMAIN}/user/xxx`, {
      name: 'jason2',
    });
    expect(data).toEqual({ method: 'patch', name: 'jason2' });
  });

  test('http delete', async () => {
    const data = await client.delete(`${TEST_DOMAIN}/user/xxx`);
    expect(data).toEqual({ method: 'delete' });
  });
});
