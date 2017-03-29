'use strict';

const path = require('path');

exports.getName = function getName(chunkName, ext, hashName, DEV_MODE) {
  return chunkName + (DEV_MODE ? '.' : '-[' + (hashName ? hashName : 'chunkhash') + ':9].') + ext;
};

exports.getResourceName = function getResourceName(DEV_MODE) {
  return exports.getName('[path][name]', '[ext]', 'hash', DEV_MODE);
};

exports.getStyleLoaders = function getStyleLoaders() {
  const lastArg = arguments[arguments.length - 1];
  const isLastArgBoolean = typeof lastArg === 'boolean';
  const DEV_MODE =  isLastArgBoolean? lastArg : true;
  const temp = [];
  for(let i = 0, length = (isLastArgBoolean
    ? arguments.length - 1
    : arguments.length); i < length; i++) {
      const tempLoader = {
        loader: arguments[i],
        options: {},
      };
      if(DEV_MODE) {
        tempLoader.options.sourceMap = '';
      }
      temp.push(tempLoader);
  }
  return temp;
};

exports.resolve = function resolve (dir) {
  return path.join(__dirname, '..', dir);
};

exports.CONTENT_PATH = exports.APP_PATH = exports.resolve('src');

exports.APP_BUILD_PATH = exports.resolve('build/app');