/**
 * Proxy/Send requests to backend or other endpoints
 */

const got = require('got');
const tunnel = require('tunnel');
const SocksProxyAgent = require('socks-proxy-agent');
const { URL } = require('url');
const util = require('util');
const { logger } = require('./logger');
const appConfig = require('../config/env');
const { HTTP_METHOD } = require('./http-config');
const isCustomAPIPrefix = appConfig.isCustomAPIPrefix();
const httpProxy = appConfig.getHttpProxy();
const socksProxy = appConfig.getSocksProxy();
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
 */
const defaultRequestOptions = {
  throwHttpErrors: false,
};

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
   * @param {object=} gotOptions - default options for "got" module
   */
  constructor(options = {}, gotOptions = {}) {
    this.endPoint = options.endPoint || '';
    this.endPointHost = '';
    this.endPointParsedUrl = {};
    if (this.endPoint) {
      this.endPointParsedUrl = new URL(this.endPoint);
      this.endPointHost = this.endPointParsedUrl.host;
    }
    this.useFormData = options.useForm === true;
    this.useJsonResponse = options.jsonResponse !== false;
    const clientBaseOptions = {
      prefixUrl: this.endPoint,
    };
    const agent = this._getAgent();
    if (agent) {
      clientBaseOptions.agent = agent;
    }
    this.options = options;
    this.got = got.extend(
      Object.assign(clientBaseOptions, defaultRequestOptions, gotOptions),
    );
    this.debugLevel = options.debugLevel || debugLevel;
  }

  /**
   * Get the http agent for proxying or requesting,
   * NOTE: when use https endpoint, you may need to set "NODE_TLS_REJECT_UNAUTHORIZED=0" node option
   * with self signed certificate to bypass the TLS check
   * @return {*}
   * @private
   */
  _getAgent() {
    let agent;
    //Simple proxy tunnel
    if (socksProxy) {
      const socksProtocol = 'socks:';
      agent = new SocksProxyAgent(
        String(socksProxy).startsWith(socksProtocol)
          ? socksProxy
          : `${socksProtocol}//${socksProxy}`,
      );
    } else if (httpProxy) {
      const parsedUrl = new URL(httpProxy);
      const tunnelOptions = {
        proxy: {
          host: parsedUrl.hostname,
          port: parsedUrl.port,
        },
      };
      agent =
        this.endPointParsedUrl.protocol === 'https:'
          ? tunnel.httpsOverHttp(tunnelOptions)
          : tunnel.httpOverHttp(tunnelOptions);
    }
    return agent;
  }

  /**
   * Customize real options for destination
   * @param ctx
   * @param options
   * @return {object}
   */
  _prepareRequestOptions(ctx, options = { headers: {} }) {
    options.method = ctx.method;
    options.headers = Object.assign({}, ctx.headers, options.headers);
    return this._finalizeRequestOptions(ctx.url, options);
  }

  /**
   * Proxy koa http request to another endpoint
   * @param ctx - koa ctx
   * @param opts - request options
   * @return {Stream}
   */
  proxyRequest(ctx, opts = {}) {
    let requestStream;
    const { url, options } = this._prepareRequestOptions(ctx, opts);
    // console.log('opts: ', opts);
    requestStream = ctx.req.pipe(this.got.stream(url, options));
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
    requestStream.on('response', (response) => {
      gotResponse = response;
      const request = response.request;
      if (request) {
        gotOptions = request.options;
        this._log(
          `[${response.url}] request options: \n${util.inspect(
            request.options,
          )}`,
        );
      }
      this._log(
        `[${response.url}] response headers: \n${util.inspect(
          response.headers,
        )}`,
      );
    });

    if (this.debugLevel > DEBUG_LEVEL.PLAIN) {
      requestStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      requestStream.on('end', () => {
        const ret = Buffer.concat(chunks);
        const type = gotResponse.headers['content-type'];
        if (this._isPlainTextBody(type)) {
          this._log(
            `[${gotOptions.method}][${
              gotResponse.url
            }] response body: ${ret.toString()}`,
          );
        } else {
          this._log(
            `[${gotOptions.method}][${gotResponse.url}] response body[${type}] length: ${ret.length}`,
          );
        }
      });
    }
  }

  /**
   * Send http requests
   * @param requestUrl
   * @param opts
   * @return {Promise<any>}
   */
  async sendRequest(requestUrl, opts = {}) {
    const { url, options } = this._finalizeRequestOptions(requestUrl, opts);
    // console.log('opts: ', opts);
    let ret = {};
    try {
      if (this.useJsonResponse) {
        ret = await this.got(url, options).json();
      } else {
        const response = await this.got(url, opts);
        ret = response.body;
      }
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
      options.searchParams = query;
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
    if (this.useFormData) {
      options.form = data;
      options.json = undefined;
    } else {
      options.json = data;
      options.form = undefined;
    }
    // options.body = data;
    return options;
  }

  /**
   * Get final request options
   * @param url
   * @param options - custom options
   * @return {object<{url, options}>} final request options
   */
  _finalizeRequestOptions(url, options = {}) {
    let optionPrefix = options.prefix || this.options.prefix;
    if (typeof url === 'string' && isCustomAPIPrefix && optionPrefix) {
      url = url.replace(new RegExp(`^${optionPrefix}/?`), '');
    }
    if (!options.headers) {
      options.headers = {};
    }
    if (this.endPointHost) {
      options.headers.host = this.endPointHost;
    }
    return {
      url,
      options,
    };
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
