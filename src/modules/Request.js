import qs from 'qs';
import URL from 'url-parse';
import isEmpty from 'lodash.isempty';
import 'whatwg-fetch';
import {
  api,
  formatRestfulUrl,
  numberOfRestParams,
} from '../../api/api-config';
import env from 'modules/env';

const fetch = window.fetch;

const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_FORM_URL_ENCODED =
  'application/x-www-form-urlencoded;charset=UTF-8';

const defaultOptions = {
  credentials: 'same-origin',
};

function jsonResponseHandler(data) {
  return Promise.resolve(data);
}

class Request {
  constructor(options = {}) {
    if (!(this instanceof Request)) {
      return new Request(options);
    }

    this.jsonResponseHandler = jsonResponseHandler.bind(this);

    //no api prefix for the instance
    this.noPrefix = !!options.noPrefix;
    //set default api prefix
    this.apiPrefix = options.apiPrefix || (this.noPrefix ? '' : env.apiPrefix);

    const ops = { ...defaultOptions };

    this.formURLEncoded = !!options.form;

    ops.headers = {
      'Content-Type': this.formURLEncoded
        ? CONTENT_TYPE_FORM_URL_ENCODED
        : CONTENT_TYPE_JSON,
    };

    if (!isEmpty(options) && !isEmpty(options.headers)) {
      ops.headers = Object.assign({}, ops.headers, options.headers);
      delete options.headers;
    }
    //set custom fetch options for the instance
    this.options = Object.assign(ops, options);
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

  static isPlainUrl(url) {
    return 'string' === typeof url;
  }

  sendRequest(url, options = {}) {
    const originalUrlConfig = url;
    url = Request.isPlainUrl(url) ? url : url.path;
    if (!isEmpty(options.qs)) {
      url = this.addQueryString(url, options.qs);
    }

    url = this.normalizeRestfulParams(url, options);

    const originalUrl = url;
    if (!options.noPrefix && !this.noPrefix) {
      url = this.getUrlWithPrefix(originalUrlConfig);
      options.hasOwnProperty('noPrefix') && (options.noPrefix = undefined);
    }

    const headers = {};

    const defaultHeaders = this.options.headers;
    Object.assign(headers, defaultHeaders, options.headers);
    options.headers = undefined;
    const apiOptions = Object.assign({}, this.options, options, { headers });

    return fetch(url, apiOptions)
      .then(response => {
        if (!response.ok) {
          console.error(
            `[koa-web-kit]:[API-ERROR]-[${response.status}]-[${originalUrl}]`
          );
          return Promise.reject(response);
        }
        return response.json();
      })
      .then(data => this.jsonResponseHandler(data, apiOptions));
  }

  addQueryString(url, params, baseUrl = '', noHost = true) {
    if (isEmpty(params)) return url;
    const obj = new URL(url, baseUrl);
    const addedQuery =
      'string' === typeof params ? params : qs.stringify(params);
    const query = obj.query ? `${obj.query}&${addedQuery}` : `?${addedQuery}`;
    const fullHost = obj.protocol ? `${obj.protocol}//${obj.host}` : '';
    return `${noHost ? '' : fullHost}${obj.pathname}${query}${obj.hash}`;
  }

  /**
   * Get method
   * @param {string|object} url api url config, when in object:
   * ```
   * {
   *   path: 'url',
   *   prefix: '/proxy-1', //prefix for the url
   * }
   * ```
   * @param {object=} params query strings in object
   * @param options
   * @return {*}
   */
  get(url, params, options = {}) {
    if (!isEmpty(params)) {
      url = this.addQueryString(
        Request.isPlainUrl(url) ? url : url.path,
        params
      );
    }
    return this.sendRequest(url, options);
  }

  post(url, data = {}, options = {}) {
    const postOptions = Object.assign(
      {
        method: 'POST',
        body: this.normalizePostBodyData(data),
      },
      options
    );
    return this.sendRequest(url, postOptions);
  }

  put(url, data = {}, options = {}) {
    const putOptions = Object.assign(
      {
        method: 'PUT',
        body: this.normalizePostBodyData(data),
      },
      options
    );
    return this.sendRequest(url, putOptions);
  }

  delete(url, data = {}, options = {}) {
    const deleteOptions = Object.assign(
      {
        method: 'DELETE',
        body: this.normalizePostBodyData(data),
      },
      options
    );
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

    if (!Request.isPlainUrl(url)) {
      url = `${url.prefix}${url.path}`;
    }

    url = this.normalizeRestfulParams(url, options);

    const apiOptions = Object.assign(
      {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      },
      options
    );
    return fetch(url, apiOptions)
      .then(response => response.json())
      .then(data => this.jsonResponseHandler(data, apiOptions));
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

  normalizeRestfulParams(url, options) {
    const restLength = numberOfRestParams(url);
    const restParams = !isEmpty(options.restParams) ? options.restParams : [];
    if (restLength > 0) {
      if (restLength > restParams.length) {
        restParams.unshift(this.storeId || '0');
      }
      url = formatRestfulUrl(url, restParams);
    }
    return url;
  }

  formatFormUrlEncodeData(data) {
    const params = new URLSearchParams();
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        params.append(key, data[key]);
      }
    }
    return params.toString();
  }

  normalizePostBodyData(data = {}) {
    return this.formURLEncoded
      ? this.formatFormUrlEncodeData(data)
      : JSON.stringify(data);
  }

  getUrlWithPrefix(urlConfig) {
    let ret = '';
    const plain = Request.isPlainUrl(urlConfig);
    if (plain) {
      ret += this.apiPrefix;
    } else {
      ret += urlConfig.prefix || this.apiPrefix;
    }
    ret += plain ? urlConfig : urlConfig.path;
    return ret;
  }
}

export { Request, api };
export default new Request();
