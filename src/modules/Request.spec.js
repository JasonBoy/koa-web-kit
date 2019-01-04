import r, { api } from './Request';

const myUrl = `http://127.0.0.1:3000${api.TEST}?a=b&b=c&a=bb`;
const myUrl2 = `${myUrl}#myHash`;

test('get current page query', () => {
  const query = r.getQueryString(myUrl);
  expect(query).toEqual({ a: ['b', 'bb'], b: 'c' });
});

test('add query to current url', () => {
  const newUrl = r.addQueryString(myUrl, { d: 'e' }, undefined, false);
  expect(newUrl).toBe(`${myUrl}&d=e`);
});

test('should strip url hash', () => {
  const newUrl = r.stripUrlHash(myUrl2);
  expect(newUrl).toBe(myUrl);
});
