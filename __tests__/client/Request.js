import r, { api, Request } from 'modules/Request';

const origin = 'http://127.0.0.1:3000';
const myUrl = `${origin}${api.TEST}?a=b&b=c&a=bb`;
const myUrl2 = `${myUrl}#myHash`;

test('getQueryString()', () => {
  const query = r.getQueryString(`${origin}?a=&b=c`);
  expect(query).toEqual({ a: '', b: 'c' });
});

test('getQueryString() multiple values for same key', () => {
  const query = r.getQueryString(myUrl);
  expect(query).toEqual({ a: ['b', 'bb'], b: 'c' });
});

test('addQueryString()', () => {
  const newUrl = r.addQueryString(myUrl, { d: 'e' }, undefined, false);
  expect(newUrl).toBe(`${myUrl}&d=e`);
});

test('stripUrlHash()', () => {
  const newUrl = r.stripUrlHash(myUrl2);
  expect(newUrl).toBe(myUrl);
});

test('normalizeRestfulParams() in array', () => {
  const newUrl = r.normalizeRestfulParams('/school/:id/classroom/:roomId', {
    restParams: ['123', '456'],
  });
  expect(newUrl).toBe('/school/123/classroom/456');
});
test('normalizeRestfulParams() in object', () => {
  const newUrl = r.normalizeRestfulParams('/school/:id/classroom/:roomId', {
    restParams: {
      roomId: '456',
      id: '123',
    },
  });
  expect(newUrl).toBe('/school/123/classroom/456');
});

test('formatFormUrlEncodeData()', () => {
  let data = r.formatFormUrlEncodeData({ a: 'b', c: 1 });
  data = decodeURIComponent(data);
  expect(data).toBe('a=b&c=1');
});
test('formatFormUrlEncodeData() value in array', () => {
  let data = r.formatFormUrlEncodeData({ a: ['b', 'bb'], c: 1 });
  data = decodeURIComponent(data);
  expect(data).toBe('a=b,bb&c=1');
});

test('normalizeBodyData()', () => {
  const data = { a: 'b', c: 1 };
  const newData = r.normalizeBodyData(data);
  expect(newData).toBe(JSON.stringify(data));
});
test('normalizeBodyData() in form_url_encoded', () => {
  const temp = new Request({ form: true });
  const data = { a: 'b', c: 1 };
  const newData = temp.normalizeBodyData(data);
  expect(newData).toBe('a=b&c=1');
});

test('getUrlWithPrefix(string)', () => {
  const temp = new Request({ apiPrefix: '/test' });
  const newUrl = temp.getUrlWithPrefix('/login');
  expect(newUrl).toBe('/test/login');
});

test('getUrlWithPrefix(object)', () => {
  const temp = new Request({ apiPrefix: '/test' });
  const newUrl = temp.getUrlWithPrefix({ prefix: '/test2', path: '/login' });
  expect(newUrl).toBe('/test2/login');
});
