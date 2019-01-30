/**
 * Proxy/Send requests to backend or other endpoints
 */

const got = require('got');
const tunnel = require('tunnel');
const { URL } = require('url');
const util = require('util');
const { logger } = require('./logger');
const appConfig = require('../config/env');
const { HTTP_METHOD } = require('./http-config');
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
  defaultRequestOptions.agent = tunnel.httpOverHttp({
    proxy: {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
    },
  });
}

/**
 * Proxy for apis or other http requests
 */
class HttpClient {
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
    this.endPoint = options.hasOwnProperty('endPoint')
      ? options.endPoint
      : defaultEndpoint;
    this.options = options;
    this.got = got.extend(
      Object.assign(
        {
          baseUrl: this.endPoint,
        },
        defaultRequestOptions,
        requestOptions
      )
    );
    this.debugLevel = options.debugLevel || debugLevel;
  }

  /**
   * Customize real options for destination
   * @param ctx
   * @param options
   * @return {object}
   */
  _prepareRequestOptions(ctx, options = { headers: {} }) {
    options.url = ctx.url;
    options.method = ctx.method;
    options.headers = Object.assign({}, ctx.headers, options.headers);
    return this._finalizeRequestOptions(options);
  }

  /**
   * Proxy koa http request to another endpoint
   * @param ctx - koa ctx
   * @param options - custom request options
   * @return {Stream}
   */
  proxyRequest(ctx, options = {}) {
    let requestStream;
    const opts = this._prepareRequestOptions(ctx, options);
    // console.log('opts: ', opts);

    requestStream = ctx.req.pipe(this.got.stream(opts.url, opts));
    if (this.debugLevel) {
      this.handleProxyEvents(requestStream);
    }
    requestStream.on('error', (error, body) => {
      this._log(null, error, LOG_LEVEL.ERROR);
      this._log(`response body: ${JSON.stringify(body)}`);
    });
    return requestStream;
  }

  handleProxyEvents(requestStream) {
    let chunks = [];
    let gotOptions = {};
    let gotResponse;
    requestStream.on('response', response => {
      gotResponse = response;
      const request = response.request;
      if (request) {
        gotOptions = request.gotOptions;
        this._log(
          `[${response.url}] request options: \n${util.inspect(
            request.gotOptions
          )}`
        );
      }
      this._log(
        `[${response.url}] response headers: \n${util.inspect(
          response.headers
        )}`
      );
    });

    if (this.debugLevel > DEBUG_LEVEL.PLAIN) {
      requestStream.on('data', chunk => {
        chunks.push(chunk);
      });
      requestStream.on('end', () => {
        const ret = Buffer.concat(chunks);
        const type = gotResponse.headers['content-type'];
        if (this._isPlainTextBody(type)) {
          this._log(
            `[${gotOptions.method}][${
              gotOptions.href
            }] response body: ${ret.toString()}`
          );
        } else {
          this._log(
            `[${gotOptions.method}][${
              gotOptions.href
            }] response body[${type}] length: ${ret.length}`
          );
        }
      });
    }
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
    const opts = this._finalizeRequestOptions(options);
    // console.log('opts: ', opts);
    let ret = {};
    try {
      const response = await this.got(opts.url, opts);
      ret = response.body;
    } catch (err) {
      this._log(null, err, LOG_LEVEL.ERROR);
      return Promise.reject(err);
    }
    return Promise.resolve(ret);
  }

  /**
   * Proxy logger
   * @param {*=} msg - log message
   * @param {Error=} error - the Error instance
   * @param {string=} level - log level
   */
  _log(msg, error, level = LOG_LEVEL.INFO) {
    msg && logger[level](msg);
    error && logger[level](error.stack);
  }

  /**
   * Throw an exception
   * @param msg
   */
  _exception(msg) {
    throw new Error(msg);
  }

  get(url, query, options = {}) {
    options.method = HTTP_METHOD.GET;
    if (query) {
      options.query = query;
    }
    return this.sendRequest(url, options);
  }

  post(url, body, options = {}) {
    return this.sendRequestWithBody(url, body, HTTP_METHOD.POST, options);
  }

  put(url, body, options = {}) {
    return this.sendRequestWithBody(url, body, HTTP_METHOD.PUT, options);
  }

  patch(url, body, options = {}) {
    return this.sendRequestWithBody(url, body, HTTP_METHOD.PATCH, options);
  }

  delete(url, options = {}) {
    options.method = HTTP_METHOD.DELETE;
    return this.sendRequest(url, options);
  }

  sendRequestWithBody(url, body, method, options = {}) {
    this._normalizeBodyContentType(body, options);
    options.method = method;
    return this.sendRequest(url, options);
  }

  /**
   * Normalize body for the upcoming request
   * @param data - body data
   * @param options - to which the body data will be attached
   * @return {object}
   */
  _normalizeBodyContentType(data, options = {}) {
    options.body = data;
    return options;
  }

  /**
   * Get final request options
   * @param options - custom options
   * @return {object} final request options
   */
  _finalizeRequestOptions(options = {}) {
    let optionPrefix = options.prefix || this.options.prefix;
    // TODO: a path rewrite could be better
    if (isCustomAPIPrefix && optionPrefix) {
      options.url = options.url.replace(new RegExp(`^${optionPrefix}`), '');
    }
    return options;
  }

  _isPlainTextBody(contentType) {
    if (!contentType) return true;
    return !!(
      contentType.startsWith('text/') ||
      contentType.startsWith('application/json')
    );
  }
}

exports.HttpClient = HttpClient;
