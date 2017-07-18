/**
 * proxy request to backend
 */

const request = require('request');
const _ = require('lodash');
const Promise = require('bluebird');

const logger = require('../mw/logger');
const appConfig = require('../config/env');

const debugLevel = appConfig.getProxyDebugLevel();

if (debugLevel && debugLevel > 0) {
  if (debugLevel >= 1) request.debug = true;
  if (debugLevel >= 2) require('request-debug')(request);
}

exports.getProxyOptions = getProxyOptions;

exports.dispatchRequest = function () {
  return getApiPromise.apply(this, Array.from(arguments));
};

/**
 *
 * @param apiEndpoint
 * @param needPromise
 * @param options
 */
function getApiPromise(apiEndpoint, needPromise, options) {
  let apiRequest = undefined;
  const ctx = this;
  const req = ctx.req;
  const p = new Promise(function (resolve, reject) {
    apiRequest = req.pipe(request(getProxyOptions.call(ctx, apiEndpoint, options), function (err, response, body) {
      if (err) {
        logger.error(err);
      }
      if (response.statusCode !== 200) {
        reject({body, response, err});
      } else {
        resolve({body, response});
      }
    }));
  });
  if (!needPromise) {
    apiRequest.pipe(ctx.res);
  }
  return p;
}

/**
 *
 * @param {string} apiEndPoint
 * @param {object} options
 * @returns {object}
 */
function getProxyOptions(apiEndPoint, options) {
  let defaultOptions = {
    url: this.url,
    baseUrl: apiEndPoint ? apiEndPoint : '',
    method: this.method,
    // json: true,
    gzip: true
  };
  if (!_.isEmpty(options)) {
    defaultOptions = Object.assign(defaultOptions, options);
  }
  return defaultOptions;
}