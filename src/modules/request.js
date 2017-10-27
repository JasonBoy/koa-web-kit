import qs from 'qs';
import URL from 'url-parse';
import isEmpty from 'lodash.isempty';
import 'whatwg-fetch';
import {api, formatRestfulUrl, numberOfRestParams} from '../../api/api-config';

const fetch = window.fetch;

const defaultOptions = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "same-origin",
};

function jsonResponseHandler(data, apiOptions) {
  return Promise.resolve(data);
}

class Request {

  constructor(options) {

    if (!(this instanceof Request)) {
      return new Request();
    }

    this.jsonResponseHandler = jsonResponseHandler.bind(this);

    const ops = {...defaultOptions};
    if(!isEmpty(options) && !isEmpty(options.headers)) {
      ops.headers = Object.assign({}, ops.headers, options.headers);
      delete options.headers;
    }
    //set custom fetch options for the instance
    this.options = Object.assign({}, ops, options);
  }

  static get fetch() {
    return fetch;
  }

  static get api() {
    return api;
  }

  static get formatRestfulUrl() {
    return formatRestfulUrl;
  }

  sendRequest(url, options = {}) {
    if (!isEmpty(options.qs)) {
      url = this.addQueryString(url, options.qs);
    }

    url = this.normalizeRestfulParams(url, options);

    const apiOptions = Object.assign({}, this.options, options);
    return fetch(
      url,
      apiOptions
    )
      .then(response => {
        if (!response.ok) {
          console.log(`[API-ERROR]-[${response.status}-[${new URL(response.url).pathname}]`);
          return Promise.reject(response);
        }
        return response.json()
      })
      .then(data => this.jsonResponseHandler(data, apiOptions))
      ;
  }

  addQueryString(url, params, baseUrl, noHost = false) {
    if (isEmpty(params)) return url;
    const obj = new URL(url, baseUrl || '');
    console.log('url obj:', obj);
    const addedQuery = ('string' === typeof params)
      ? params : qs.stringify(params);
    const query = obj.query ? `${obj.query}&${addedQuery}` : `?${addedQuery}`;
    const fullHost = obj.protocol ? `${obj.protocol}//${obj.host}` : '';
    return `${noHost ? '' : fullHost}${obj.pathname}${query}${obj.hash}`;
  }

  get (url, params, options = {}) {
    if (!isEmpty(params)) {
      url = this.addQueryString(url, params);
    }
    return this.sendRequest(url, options);
  }

  post(url, data = {}, options = {}) {
    const postOptions = Object.assign({
      method: 'POST',
      body: JSON.stringify(data)
    }, options);
    return this.sendRequest(url, postOptions);
  }

  put(url, data = {}, options = {}) {
    const putOptions = Object.assign({
      method: 'PUT',
      body: JSON.stringify(data)
    }, options);
    return this.sendRequest(url, putOptions);
  }

  delete(url, data = {}, options = {}) {
    const deleteOptions = Object.assign({
      method: 'DELETE',
      body: JSON.stringify(data)
    }, options);
    return this.sendRequest(url, deleteOptions);
  }

  upload(url, inputFiles, extraData, fileFieldName, options = {}) {
    const formData = new FormData();
    if (!isEmpty(extraData)) {
      const keys = Object.keys(extraData);
      for (const key of keys) {
        formData.append(key, extraData[key]);
      }
    }
    const fieldName = fileFieldName || 'files';
    let i = 0;
    for (; i < inputFiles.length; i++) {
      formData.append(fieldName, inputFiles[i]);
    }

    url = this.normalizeRestfulParams(url, options);

    const apiOptions = Object.assign({
      method: 'POST',
      body: formData,
      credentials: "same-origin",
    }, options);
    return fetch(url, apiOptions)
      .then(response => response.json())
      .then(data => this.jsonResponseHandler(data, apiOptions))
      ;
  }

  getQueryString(url = location.href) {
    const obj = new URL(url, true);
    return obj.query;
  }

  genURL(url, parseQS = false) {
    return new URL(url, parseQS);
  }

  stripUrlHash(url) {
    const u = this.genURL(url);
    return `${u.origin}${u.pathname}${u.query}`;
  }

  normalizeRestfulParams (url, options) {
    const restLength = numberOfRestParams(url);
    const restParams = !isEmpty(options.restParams) ? options.restParams : [];
    if(restLength > 0) {
      if(restLength > restParams.length) {
        restParams.unshift(this.storeId || '0');
      }
      url = formatRestfulUrl(url, restParams);
    }
    return url;
  }

}

export {Request, api};
export default new Request();