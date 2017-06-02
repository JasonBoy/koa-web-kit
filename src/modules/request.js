// const qs = require('qs');
// const URL = require('url-parse');
// const isEmpty = require('lodash.isempty');
// require('whatwg-fetch');

import qs from 'qs';
import URL from 'url-parse';
import isEmpty from 'lodash.isempty';
import 'whatwg-fetch';

const fetch = window.fetch;
// const fetch = {};

const defaultOptions = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "same-origin",
};

function request(url, options = {}) {
  if(!isEmpty(options.qs)) {
    url = request.addQueryString(url, options.qs);
  }
  return fetch(
    url,
    Object.assign({}, defaultOptions, options)
  )
    .then(response => response.json());
}

request.addQueryString = function addQueryString (url, params) {
  if (isEmpty(params)) return url;
  const obj = new URL(url);
  const addedQuery = ('string' === typeof params)
    ? params : qs.stringify(params);
  const query = obj.query ? `${obj.query}&${addedQuery}` : `?${addedQuery}`;
  const fullHost = obj.protocol ? `${obj.protocol}//${obj.host}` : '';
  return `${fullHost}${obj.pathname}${query}${obj.hash}`;
};

request.get = function get(url, params, options = {}) {
  if (!isEmpty(params)) {
    url = request.addQueryString(url, params);
  }
  return request(url, options);
};

request.post = function post(url, data = {}, options = {}) {
  const postOptions = Object.assign({
    method: 'POST',
    body: JSON.stringify(data)
  }, options);
  return request(url, postOptions);
};

request.put = function put(url, data = {}, options = {}) {
  const putOptions = Object.assign({
    method: 'PUT',
    body: JSON.stringify(data)
  }, options);
  return request(url, putOptions);
};

request.delete = function (url, data = {}, options = {}) {
  const deleteOptions = Object.assign({
    method: 'DELETE',
    body: JSON.stringify(data)
  }, options);
  return request(url, deleteOptions);
};

// const url1 = 'http://localhost:3000/a/b?x=y';
// const url2 = '/a/b?x=y';
// const url3 = '/a/b';
// const url4 = 'http://localhost:3000/a/b?x=yxx#hhhh';
// console.log(request.addQueryString(url1, {xx: 'yy'}));
// console.log(request.addQueryString(url2, {xx: 'yy'}));
// console.log(request.addQueryString(url3, {xx: 'yy'}));
// console.log(request.addQueryString(url4, {xx: 'yy'}));

// module.exports = request;
export default request;