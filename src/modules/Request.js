import isEmpty from 'lodash.isempty';
import 'whatwg-fetch';
import {
  api,
  formatRestfulUrl,
  numberOfRestParams,
} from '../../api/api-config';
import env from 'modules/env';

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
  /**
   *
   * @param options
   * {
   *   noPrefix: boolean, //if there is prefix for the instance
   *   apiPrefix: string, //prefix for the instance if "noPrefix" is false
   *   form: boolean, //true, body is "x-www-form-urlencoded", otherwise "json"
   *   ...fetch_api_related_options,
   * }
   * @return {Request}
   */
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

  /**
   * Send request now
   * @param {string|object} pathname if object, @see demo in "api-config.js"
   * @param {object} options
   * {
   *   noPrefix: true, //if there is prefix for this single request, default based on the instance's "noPrefix"
   *   qs: {}, //extra query string for the request
   *   restParams: [Array|Object], //params in pathname, @see formatRestfulUrl
   *   ...fetch_api_related_options,
   * }
   * @see https://github.com/github/fetch
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
   * @return {Promise<Response | Object>}
   */
  sendRequest(pathname, options = {}) {
    let url = pathname;
    url = Request.isPlainUrl(url) ? url : url.path;
    const originalUrl = url;
    //normalize rest params
    url = this.normalizeRestfulParams(url, options);
    //normalize prefix
    if (!options.noPrefix && !this.noPrefix) {
      url = this.getUrlWithPrefix(url);
      options.hasOwnProperty('noPrefix') && (options.noPrefix = undefined);
    }
    //normalize query string
    if (!isEmpty(options.qs)) {
      url = this.addQueryString(url, options.qs);
    }
    //normalize headers
    const headers = {};
    const defaultHeaders = this.options.headers;
    Object.assign(headers, defaultHeaders, options.headers);
    options.headers = undefined;
    const apiOptions = Object.assign({}, this.options, options, { headers });
    if (apiOptions.multipart) {
      delete apiOptions.headers['Content-Type'];
    }
    return fetch(url, apiOptions).then(response => {
      if (!response.ok) {
        console.error(
          `[koa-web-kit]:[API-ERROR]-[${response.status}]-[${originalUrl}]`
        );
        return Promise.reject(response);
      }
      if (response.status === 204) {
        return Promise.resolve();
      }
      if (this.isJSONResponse(response)) {
        return response
          .json()
          .catch(err => {
            console.error(err);
            return {};
          })
          .then(data => this.jsonResponseHandler(data, apiOptions));
      }
      return Promise.resolve(response);
    });
  }

  /**
   * Add query to the current url
   * @param {string} url - current url
   * @param {object} query - query object which will be added
   * @param {string=} baseUrl - baseUrl
   * @param {boolean=} noHost - return the url without the host, default true
   * @return {string} - new url string
   */
  addQueryString(url, query, baseUrl = location.origin, noHost = true) {
    if (isEmpty(query)) return url;
    const obj = new URL(url, baseUrl);
    for (const key of Object.keys(query)) {
      obj.searchParams.append(key, query[key]);
    }
    if (!noHost) {
      return obj.toString();
    }

    return `${obj.pathname}${obj.search}${obj.hash}`;
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
      options.qs = params;
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

  /**
   * Upload files
   * @param {string} url - upload url
   * @param {Array} inputFiles - File objects in array
   * @param {object=} extraData - extra body object
   * @param {string=} fileFieldName - field name for inputFiles
   * @param {object=} options - other request options
   * @return {Promise<Response|Object>}
   */
  upload(url, inputFiles, extraData, fileFieldName = 'files', options = {}) {
    const formData = new FormData();
    if (!isEmpty(extraData)) {
      const keys = Object.keys(extraData);
      for (const key of keys) {
        formData.append(key, extraData[key]);
      }
    }
    let i = 0;
    for (; i < inputFiles.length; i++) {
      formData.append(fileFieldName, inputFiles[i]);
    }

    const apiOptions = Object.assign(
      {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        multipart: true,
      },
      options
    );
    return this.sendRequest(url, apiOptions);
  }

  /**
   * Get the query from url
   * @param url
   * @param baseUrl
   * @return {object} - parsed query string
   */
  getQueryString(url = location.href, baseUrl = location.origin) {
    const obj = new URL(url, baseUrl);
    const query = {};
    for (const [key, value] of obj.searchParams.entries()) {
      if (query.hasOwnProperty(key)) {
        query[key] = [].concat(query[key], value);
      } else {
        query[key] = value;
      }
    }
    return query;
  }

  /**
   * Remove the hash from url
   * @param url
   * @param baseUrl
   * @return {string} - new url without the hash
   */
  stripUrlHash(url, baseUrl = location.origin) {
    const u = new URL(url, baseUrl);
    u.hash = '';
    return u.toString();
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

  isJSONResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    return contentType.indexOf('application/json') >= 0;
  }
}

window.temp = new Request();
export { Request, api };
export default new Request();
