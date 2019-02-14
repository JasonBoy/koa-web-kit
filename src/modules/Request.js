import isEmpty from 'lodash.isempty';
import {
  api,
  formatRestfulUrl,
  numberOfRestParams,
} from '../../api/api-config';
import {
  HEADER,
  BODY_TYPE,
  isJSONResponse,
  HTTP_METHOD,
} from '../../services/http-config';
import env from './env';

const CONTENT_TYPE_JSON = BODY_TYPE.JSON;
const CONTENT_TYPE_FORM_URL_ENCODED = BODY_TYPE.FORM_URL_ENCODED;

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
      [HEADER.CONTENT_TYPE]: this.formURLEncoded
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

  static isPlainUrl(url) {
    return 'string' === typeof url;
  }

  checkIfFetchAvailable() {
    return typeof fetch !== 'undefined';
  }

  async fetchPolyfill() {
    await import(/* webpackChunkName: "whatwg-fetch" */ 'whatwg-fetch');
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
  async sendRequest(pathname, options = {}) {
    if (!this.checkIfFetchAvailable()) {
      await this.fetchPolyfill();
    }
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
      delete apiOptions.headers[HEADER.CONTENT_TYPE];
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
      if (isJSONResponse(response)) {
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
  get(url, params = {}, options = {}) {
    const getOptions = Object.assign(
      {
        method: HTTP_METHOD.GET,
        qs: params,
      },
      options
    );
    return this.sendRequest(url, getOptions);
  }

  post(url, data = {}, options = {}) {
    this.sendRequestWithBody(url, data, HTTP_METHOD.POST, options);
  }

  put(url, data = {}, options = {}) {
    this.sendRequestWithBody(url, data, HTTP_METHOD.PUT, options);
  }

  patch(url, data = {}, options = {}) {
    this.sendRequestWithBody(url, data, HTTP_METHOD.PATCH, options);
  }

  delete(url, data = {}, options = {}) {
    const deleteOptions = Object.assign(
      {
        method: HTTP_METHOD.DELETE,
        body: this.normalizeBodyData(data),
      },
      options
    );
    return this.sendRequest(url, deleteOptions);
  }

  sendRequestWithBody(url, body, method, options) {
    const sendOptions = Object.assign(
      {
        method,
        body: this.normalizeBodyData(body),
      },
      options
    );
    return this.sendRequest(url, sendOptions);
  }

  /**
   * Upload files
   * @param {string} url - upload url
   * @param {Array|Object} files - files in array or in object where key is the file field name
   * @param {Object} fields - extra body data
   * @param {Object} options - other request options
   * @return {Promise<Response|Object>}
   */
  upload(url, files, fields, options = {}) {
    const formData = new FormData();
    if (!isEmpty(fields)) {
      for (const key of Object.keys(fields)) {
        formData.append(key, fields[key]);
      }
    }
    if (Array.isArray(files)) {
      const fileFieldName = options.fileFieldName || 'files';
      let i = 0;
      for (; i < files.length; i++) {
        formData.append(fileFieldName, files[i]);
      }
    } else {
      for (const key of Object.keys(files)) {
        let value = files[key];
        if (!Array.isArray(value)) {
          value = [value];
        }
        value.forEach(v => formData.append(key, v));
      }
    }

    const apiOptions = Object.assign(
      {
        method: HTTP_METHOD.POST,
        body: formData,
        multipart: true,
      },
      defaultOptions,
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

  normalizeBodyData(data = {}) {
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

export { Request, api, formatRestfulUrl };
export default new Request();
