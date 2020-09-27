const fs = require('fs');
const path = require('path');

const { logger } = require('../services/logger');
const { slugify } = require('../utils/common');
const makeDir = require('make-dir');

const DEFAULT_CACHE_DIR = path.join(__dirname, '../build/cache');

/**
 * A simple cache implementation for SSR rendered content, if you want to store/flush cache to somewhere else, e.g: redis, you can extend this Cache to meet your own needs.
 * @param {Object<{
 *   flush: boolean,
 *   flushInterval: number,
 *   flushDir: string,
 * }>} options
 * @param {number} options.flush - if need to flush cache to some persistent storage
 * @param {boolean} options.flushInterval - in milliseconds to trigger a flush action, default 10 minutes
 * @param {string} options.flushDir - dir path to persist cached html to file, default: "${project_root}/build/cache"
 */
class Cache {
  constructor(options = {}) {
    // logger.info('Initializing SSR Cache Storage...');
    //make cache dir before hand
    this.flushDir = options.flushDir || DEFAULT_CACHE_DIR;
    makeDir.sync(this.flushDir);

    this.flushInterval = options.flushInterval || 10 * 60 * 1000; //default 10m
    //init a Map instance for in-memory cache
    this.cache = new Map();
    if (options.flush) {
      this._initFlushTimer();
    }
    // logger.info('Initialize SSR Cache Storage Done!');
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  /**
   * Flush cache to storage
   * @returns {Promise<String[]>} - resolved with Array with file names
   */
  flush() {
    const promises = [];
    for (let [key] of this.cache) {
      promises.push(this.persistSingleCache(key));
    }
    return Promise.all(promises);
  }

  /**
   * flush a single cache
   * @param key
   * @returns {Promise<String|Error>}
   */
  persistSingleCache(key) {
    //persist to file
    const fileName = `${slugify(key)}.html`;
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(this.flushDir, fileName), this.get(key), (err) => {
        if (err) {
          logger.error(err);
          return reject(err);
        }
        logger.info(`Persist cache [${key}] to file finished!`);
        resolve(fileName);
      });
    });
  }

  stopFlushTimer() {
    if (!this.flushTimer) return;
    clearInterval(this.flushTimer);
  }

  startFlushTimer() {
    this.stopFlushTimer();
    this._initFlushTimer();
  }

  _initFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush()
        .then(() => {
          logger.info('Flush SSR Cache Done!');
        })
        .catch((err) => {
          logger.error(`Flush SSR Cache Failed: ${err.message}`);
          logger.error(err.stack);
        });
    }, this.flushInterval);
  }
}

module.exports = Cache;
