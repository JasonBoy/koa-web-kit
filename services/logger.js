const fs = require('fs');
const path = require('path');
const pino = require('pino');
const koaPinoLogger = require('koa-pino-logger');
const prettifier = require('pino-pretty');
const morgan = require('koa-morgan');

const makeDir = require('make-dir');
const config = require('../config/env');

const DEV_MODE = config.isDevMode();
const logPath = path.resolve(config.getLogPath());

try {
  fs.statSync(logPath);
} catch (e) {
  makeDir.sync(logPath);
}

const prettyOptions = {
  prettyPrint: {
    levelFirst: true,
  },
  prettifier,
};

class Logger {
  /**
   *
   * @param {object=} options - Logger options
   * @param {object=} pinoOptions - options for pino
   */
  constructor(options = {}, pinoOptions = {}) {
    this.options = Object.assign({}, options);
    this.pinoOptions = Object.assign(
      {
        name: 'app',
      },
      pinoOptions
    );

    this._logger = this.createLogger(null, this.options.destination);
    this._consoleLogger = this.createConsoleLogger();
  }

  /**
   * Common log method to both console and file
   * @param {string=} type - log type, default: "info"
   * @param rest
   */
  log(type = 'info', ...rest) {
    this._consoleLogger[type](...rest);
    this._logger[type](...rest);
  }

  trace(...rest) {
    this.log('trace', ...rest);
  }
  debug(...rest) {
    this.log('debug', ...rest);
  }
  info(...rest) {
    this.log('info', ...rest);
  }
  warn(...rest) {
    this.log('warn', ...rest);
  }
  fatal(...rest) {
    this.log('fatal', ...rest);
  }
  error(...rest) {
    this.log('error', ...rest);
  }

  /**
   * Create a pino logger
   * @param {object=} options - pino options
   * @param {object=} destination - pino destination, e.g: to file
   */
  createLogger(options = {}, destination) {
    return pino(
      Object.assign(this.pinoOptions, options),
      destination || pino.destination(path.join(logPath, 'app.log'))
    );
  }

  /**
   * Create a pino logger to console
   * @param {object=} options - pino options with prettifier enabled
   */
  createConsoleLogger(options) {
    return pino(Object.assign(prettyOptions, options));
  }

  /**
   * Create pino logger that log koa requests to file
   * @param {object=} options
   * @param {object=} destination
   * @return {function}
   */
  createRequestsLogger(options, destination) {
    return koaPinoLogger(
      Object.assign(
        {
          logger: this.createLogger(
            options,
            destination || pino.destination(path.join(logPath, 'requests.log'))
          ),
          serializers: {
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res,
          },
        },
        options
      )
    );
  }

  /**
   * Create a morgan koa middleware for common log format
   * @static
   * @return {*}
   */
  static createMorganLogger() {
    return morgan(DEV_MODE ? 'dev' : 'tiny');
  }
}

exports.logger = new Logger();
exports.Logger = Logger;
