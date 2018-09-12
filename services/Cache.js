const fs = require('fs');
const path = require('path');

const { logger } = require('../services/logger');
const { slugify } = require('../utils/common');
const makeDir = require('make-dir');

const DEFAULT_CACHE_DIR = path.join(__dirname, '../build/cache');

/**
 * A simple cache implementation for SSR rendered content,
 * If you want to store/flush cache to somewhere else, e.g: redis,
 * you can extend this Cache to meet your own needs.
 */
class Cache {
  /**
   *
   * @param options like below:
   * {
   *   //in milliseconds
   *   flushInterval: 60 * 1000,
   *   //if need to flush cache to some persistent storage
   *   noFlush: false,
   *   //default: `${project_root}/build/cache`,
   *   //dir path to persist cached html to file
   *   persistentDirPath: ``,
   * }
   *
   */
  constructor(options = {}) {
    logger.info('Initializing SSR Cache Storage...');
    //make cache dir before hand
    this.persistentDirPath = options.persistentDirPath || DEFAULT_CACHE_DIR;
    makeDir.sync(this.persistentDirPath);

    this.flushInterval = options.flushInterval || 10 * 60 * 1000; //default 10m
    //init a Map instance for in-memory cache
    this.cache = new Map();
    if (!options.noFlush) {
      this._initFlushTimer();
    }
    logger.info('Initialize SSR Cache Storage Done!');
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

  flush() {
    const promises = [];
    for (let [key] of this.cache) {
      promises.push(this.persistSingleCache(key));
    }
    return Promise.all(promises);
  }

  persistSingleCache(key) {
    //persist to file
    const fileName = `${slugify(key)}.html`;
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(this.persistentDirPath, fileName),
        this.get(key),
        err => {
          if (err) {
            logger.error(err);
            return reject(err);
          }
          logger.info(`Persist cache [${key}] to file finished!`);
          resolve(fileName);
        }
      );
    });
  }

  _initFlushTimer() {
    setInterval(() => {
      this.flush()
        .then(() => {
          logger.info('Flush SSR Cache Done!');
        })
        .catch(err => {
          logger.error(`Flush SSR Cache Failed: ${err.message}`);
          logger.error(err.stack);
        });
    }, this.flushInterval);
  }
}

module.exports = Cache;
