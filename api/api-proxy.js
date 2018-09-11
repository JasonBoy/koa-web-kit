/**
 * proxy request to backend
 */

const request = require('request');

const logger = require('../services/logger');
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

const defaultRequestOptions = {};
if (httpProxy) {
  defaultRequestOptions.proxy = httpProxy;
}

class APIError extends Error {
  constructor(message, response = {}, body = {}) {
    super(message);
    this.response = response;
    this.body = body;
  }
}

/**
 * Proxy for apis or other http requests
 */
class APIProxy {
  /**
   *
   * @param {object=} options - APIProxy instance options
   * {
   *   endPoint: string, //endpoint for the instance, e.g: http://domain.com
   *   prefix: string, //extra prefix for url path
   *   pipeResponse: boolean, //default true, if need to pipe the response stream directly
   *   debugLevel: number, //default based on the global app config
   * }
   * @param {object=} requestOptions - default options for request module
   */
  constructor(options = {}, requestOptions = {}) {
    this.endPoint = options.endPoint || defaultEndpoint;
    this.options = Object.assign(
      {
        pipeResponse: true,
      },
      options
    );
    this.requestOptions = Object.assign(
      {
        baseUrl: this.endPoint,
      },
      defaultRequestOptions,
      requestOptions
    );

    //init debug for proxy requests
    this.debugLevel = options.debugLevel || debugLevel;
    this.initDebugger();
  }

  initDebugger() {
    if (this.debugLevel <= 0) return;
    if (this.debugLevel >= DEBUG_LEVEL.PLAIN) request.debug = true;
    if (this.debugLevel >= DEBUG_LEVEL.VERBOSE)
      require('request-debug')(request);
  }

  /**
   * Proxy koa http request to another endpoint
   * @param ctx
   * @param options - custom request options
   * @return {Promise<any | never>}
   */
  proxyRequest(ctx, options = {}) {
    if (!ctx) {
      this.exception('koa ctx is required when proxy request');
    }
    const req = ctx.req;
    options.url = ctx.url;
    let apiRequest = null;
    let pipeResponse = options.hasOwnProperty('pipeResponse')
      ? options.pipeResponse
      : this.options.pipeResponse;
    const opts = this.finalizeRequestOptions(options);
    const p = new Promise((resolve, reject) => {
      apiRequest = req.pipe(
        request(opts, (err, response, body) => {
          this.responseHandler(err, response, body, resolve, reject);
        })
      );
    });
    if (pipeResponse) {
      if (apiRequest) {
        ctx.respond = false;
        apiRequest.pipe(ctx.res);
      } else {
        ctx.throw(500);
      }
    }
    return p.catch(rejectData => rejectData);
  }

  /**
   * Send http requests
   * @param url
   * @param options - custom request options
   * @see https://github.com/request/request
   * @return {Promise<any>}
   */
  sendRequest(url, options = {}) {
    if ('string' === typeof url) {
      options.url = url;
    }
    return new Promise((resolve, reject) => {
      request(this.finalizeRequestOptions(options), (err, response, body) => {
        this.responseHandler(err, response, body, resolve, reject);
      });
    });
  }

  responseHandler(err, response, body, resolve, reject) {
    if (err) {
      this.log(err.message, err, LOG_LEVEL.ERROR);
    }
    const options = this.requestOptions;
    const code = response ? response.statusCode : -1;
    let jsonBody = options.json ? body : {};
    //parse response as json
    if (!options.json && body && code !== 204) {
      try {
        jsonBody = JSON.parse(body);
      } catch (parseError) {
        this.log(parseError.message, parseError, LOG_LEVEL.ERROR);
      }
    }
    if (code < 200 || code >= 300) {
      reject(
        new APIError(response ? response.statusMessage : '', response, jsonBody)
      );
    } else {
      resolve(jsonBody);
    }
  }

  log(msg, error, type = LOG_LEVEL.INFO) {
    msg && logger[type](msg);
    error && logger[type](error.stack);
  }

  exception(msg) {
    throw new Error(msg);
  }

  get(url, params, options = {}) {
    options.method = 'GET';
    if (params) {
      options.qs = params;
    }
    return this.sendRequest(url, options);
  }

  post(url, data, options = {}) {
    this.normalizeBodyContentType(data, options);
    options.method = 'POST';
    return this.sendRequest(url, options);
  }

  put(url, data, options = {}) {
    this.normalizeBodyContentType(data, options);
    options.method = 'PUT';
    return this.sendRequest(url, options);
  }

  delete(url, data, options = {}) {
    this.normalizeBodyContentType(data, options);
    options.method = 'DELETE';
    return this.sendRequest(url, options);
  }

  normalizeBodyContentType(data, options = {}) {
    if (!this.requestOptions.json) {
      options.form = data;
      return options;
    }
    options.body = data;
    options.json = true;
    return options;
  }

  /**
   * Get final request options
   * @param options
   * @return {object} final request options
   */
  finalizeRequestOptions(options = {}) {
    if (!options.url) {
      this.exception('request url must be provided!');
    }
    let optionPrefix = options.prefix || this.options.prefix;
    if (isCustomAPIPrefix && optionPrefix) {
      options.url = options.url.substring(optionPrefix.length);
    }
    options.headers = Object.assign(
      {},
      this.requestOptions.headers,
      options.headers
    );
    // console.log('before opts: ', this.options, options);
    const ops = Object.assign({}, this.requestOptions, options);
    // console.log('opts: ', ops);
    return ops;
  }
}

exports.APIProxy = APIProxy;
exports.APIError = APIError;
exports.proxy = new APIProxy({}, { json: true });
