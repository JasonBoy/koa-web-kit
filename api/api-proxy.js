/**
 * Proxy/Send requests to backend or other endpoints
 */

const got = require('got');
const tunnel = require('tunnel');
const { URL } = require('url');

const { logger } = require('../services/logger');
const appConfig = require('../config/env');
const isCustomAPIPrefix = appConfig.isCustomAPIPrefix();
const defaultEndpoint = appConfig.getDefaultApiEndPoint();
const httpProxy = appConfig.getHttpProxy();
const debugLevel = appConfig.getProxyDebugLevel();

const DEBUG_LEVEL = {
  NONE: 0,
  PLAIN: 1,
  VERBOSE: 2,
};

const LOG_LEVEL = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * proxy global default got options
 * @type {{throwHttpErrors: boolean}}
 */
const defaultRequestOptions = {
  throwHttpErrors: false,
};

//Simple proxy tunnel for easier debug
if (httpProxy) {
  const parsedUrl = new URL(httpProxy);
  defaultGotOptions.agent = tunnel.httpOverHttp({
    proxy: {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
    },
  });
}

//Some common used http headers
const HEADER = {
  CONTENT_TYPE: 'Content-Type',
};

/**
 * Proxy for apis or other http requests
 */
class Proxy {
  /**
   *
   * @param {object=} options - Proxy instance options
   * {
   *   endPoint: string, //endpoint for the instance, e.g: http://domain.com
   *   prefix: string, //extra prefix for url path
   *   debugLevel: number, //default based on the global app config
   * }
   * @param {object=} requestOptions - default options for "got" module
   */
  constructor(options = {}, requestOptions = {}) {
    this.endPoint = options.endPoint || defaultEndpoint;
    this.options = options;
    this.requestOptions = Object.assign(
      {
        baseUrl: this.endPoint,
      },
      defaultRequestOptions,
      requestOptions
    );

    this.debugLevel = options.debugLevel || debugLevel;
  }

  /**
   * Customize real options for destination
   * @param ctx
   * @param options
   * @return {any}
   */
  prepareRequestOptions(ctx, options = { headers: {} }) {
    options.url = ctx.url;
    options.method = ctx.method;
    options.headers = Object.assign({}, ctx.headers, options.headers);
    return this.finalizeRequestOptions(options);
  }

  /**
   * Proxy koa http request to another endpoint
   * @param ctx - koa ctx
   * @param options - custom request options
   * @return {Stream}
   */
  proxyRequest(ctx, options = {}) {
    let apiRequest;
    const opts = this.prepareRequestOptions(ctx, options);
    // console.log('opts: ', opts);

    apiRequest = ctx.req.pipe(got.stream(opts.url, opts));
    apiRequest.on('error', (error, body) => {
      this.log(null, error, LOG_LEVEL.ERROR);
      this.log(`response body: ${JSON.stringify(body)}`);
    });
    return apiRequest;
  }

  /**
   * Send http requests
   * @param {string|object} url - request url in string or object which has a "url" property
   * @param {object=} options - custom request options
   * @return {Promise<any>}
   */
  async sendRequest(url, options = {}) {
    if ('string' === typeof url) {
      options.url = url;
    }
    const opts = this.finalizeRequestOptions(options);
    // console.log('opts: ', opts);
    let ret = {};
    try {
      const response = await got(opts.url, opts);
      ret = response.body;
    } catch (err) {
      this.log(null, err, LOG_LEVEL.ERROR);
      return Promise.reject(err);
    }
    return Promise.resolve(ret);
  }

  /**
   * Proxy logger
   * @param {string=} msg - log message
   * @param {Error=} error - the Error instance
   * @param {string=} level - log level
   */
  log(msg, error, level = LOG_LEVEL.INFO) {
    msg && logger[level](msg);
    error && logger[level](error.stack);
  }

  /**
   * Throw an exception
   * @param msg
   */
  exception(msg) {
    throw new Error(msg);
  }

  get(url, query, options = {}) {
    options.method = 'GET';
    if (query) {
      options.query = query;
    }
    return this.sendRequest(url, options);
  }

  post(url, body, options = {}) {
    this.normalizeBodyContentType(body, options);
    options.method = 'POST';
    return this.sendRequest(url, options);
  }

  put(url, body, options = {}) {
    this.normalizeBodyContentType(body, options);
    options.method = 'PUT';
    return this.sendRequest(url, options);
  }

  delete(url, options = {}) {
    options.method = 'DELETE';
    return this.sendRequest(url, options);
  }

  /**
   * Normalize body for the upcoming request
   * @param data - body data
   * @param options - to which the body data will be attached
   * @return {object}
   */
  normalizeBodyContentType(data, options = {}) {
    options.body = data;
    return options;
  }

  /**
   * Get final request options
   * @param options - custom options
   * @return {object} final request options
   */
  finalizeRequestOptions(options = {}) {
    let optionPrefix = options.prefix || this.options.prefix;
    if (isCustomAPIPrefix && optionPrefix) {
      options.url = options.url.substring(optionPrefix.length);
    }
    options.headers = Object.assign(
      {},
      this.requestOptions.headers,
      options.headers
    );
    return Object.assign({}, this.requestOptions, options);
  }

  /**
   * Get content-type from response
   * @param response
   * @return {*|string}
   */
  getResponseContentType(response) {
    return response.headers[HEADER.CONTENT_TYPE.toLowerCase()] || '';
  }

  /**
   * Check if the response has JSON body
   * @param response
   * @return {boolean}
   */
  isJSONResponse(response) {
    if (!response) return false;
    return (
      this.getResponseContentType(response).indexOf('application/json') >= 0
    );
  }
}

exports.Proxy = Proxy;
