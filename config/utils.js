'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const path = require('path');
const config = require('./env');
const SLASH_REGEX = /[\\]+/g;

const LOADER = {
  STYLE_LOADER: 'style-loader',
  CSS_LOADER: 'css-loader',
  SASS_LOADER: 'sass-loader',
  POSTCSS_LOADER: 'postcss-loader',
};

const ENTRY_NAME = {
  APP: 'app',
  VENDORS: 'vendors',
  RUNTIME: 'runtime',
  APP_JS: 'app.js',
  VENDORS_JS: 'vendors.js',
  RUNTIME_JS: 'runtime.js',
};

exports.ENTRY_NAME = ENTRY_NAME;

exports.getName = function getName(chunkName, ext, hashName, DEV_MODE) {
  return (
    chunkName +
    (DEV_MODE ? '.' : '-[' + (hashName ? hashName : 'chunkhash') + ':9].') +
    ext
  );
};

exports.getResourceName = function getResourceName(DEV_MODE) {
  return exports.getName('[path][name]', '[ext]', 'hash', DEV_MODE);
};

exports.getStyleLoaders = function getStyleLoaders() {
  const lastArg = arguments[arguments.length - 1];
  const isLastArgBoolean = typeof lastArg === 'boolean';
  const DEV_MODE = isLastArgBoolean ? lastArg : true;
  const temp = [];
  for (
    let i = 0,
      length = isLastArgBoolean ? arguments.length - 1 : arguments.length;
    i < length;
    i++
  ) {
    const tempLoader = {
      loader: arguments[i],
      options: {
        convertToAbsoluteUrls: true,
      },
    };
    if (String(arguments[i]).startsWith('sass')) {
      tempLoader.options.outputStyle = 'compressed';
    }
    if (DEV_MODE) {
      tempLoader.options.sourceMap = true;
    }
    temp.push(tempLoader);
  }
  // console.log(temp);
  return temp;
};

exports.resolve = function resolve(dir) {
  return path.join(__dirname, '..', dir);
};

exports.CONTENT_PATH = exports.APP_PATH = exports.resolve('src');

exports.APP_BUILD_PATH = exports.resolve('build/app');

exports.normalizePublicPath = function normalizePublicPath(publicPath) {
  return publicPath === '.' ? '' : publicPath;
};
exports.normalizeTailSlash = function normalizeTailSlash(
  publicPath,
  withSlash
) {
  if (publicPath.endsWith('/')) {
    publicPath = withSlash
      ? publicPath
      : publicPath.substring(0, publicPath.length - 1);
  } else {
    publicPath = withSlash ? publicPath + '/' : publicPath;
  }
  if (exports.isWindows()) {
    publicPath = exports.replaceBackwardSlash(publicPath);
  }
  return publicPath;
};
exports.normalizePath = function normalizePath(publicPath, withSlash) {
  return exports.normalizeTailSlash(
    exports.normalizePublicPath(publicPath),
    withSlash
  );
};
exports.getPublicPath = function() {
  return exports.normalizeTailSlash(
    exports.normalizePublicPath(
      path.join(config.getAppPrefix(), config.getStaticPrefix())
    ),
    config.isPrefixTailSlashEnabled()
  );
};
exports.isWindows = function isWindows() {
  return process.platform === 'win32';
};
exports.replaceBackwardSlash = function replaceBackwardSlash(str) {
  return str.replace(SLASH_REGEX, '/');
};
exports.getLoaders = function getLoaders(
  devMode = false,
  withStyleLoader = false,
  withSassLoader = true
) {
  const loaders = [LOADER.CSS_LOADER, LOADER.POSTCSS_LOADER];
  if (withStyleLoader) {
    loaders.unshift(LOADER.STYLE_LOADER);
  }
  if (withSassLoader) {
    loaders.push(LOADER.SASS_LOADER);
  }
  return exports.getStyleLoaders.apply(undefined, loaders.concat([devMode]));
};
exports.getCommonTextExtract = function getCommonTextExtract(
  name = '[name]',
  devMode = false,
  loaders,
  options
) {
  const plugin = new ExtractTextPlugin(
    Object.assign(
      {
        filename: exports.getName(name, 'css', 'contenthash', devMode),
      },
      options
    )
  );
  const loader = plugin.extract(loaders);
  return { plugin, loader };
};
exports.getSCSSLoaderExtract = function getSCSSLoaderExtract(devMode = false) {
  return {
    use: exports.getLoaders(devMode, false, true),
    fallback: LOADER.STYLE_LOADER,
  };
};
exports.getCSSLoaderExtract = function getCSSLoaderExtract(devMode = false) {
  return {
    use: exports.getStyleLoaders(
      LOADER.CSS_LOADER,
      LOADER.POSTCSS_LOADER,
      devMode
    ),
    fallback: LOADER.STYLE_LOADER,
  };
};
exports.getSCSSExtract = function getSCSSExtract(
  devMode = false,
  options = {}
) {
  return exports.getCommonTextExtract(
    '[name]',
    devMode,
    exports.getSCSSLoaderExtract(devMode),
    options
  );
};
exports.getLibSCSSExtract = function getLibSCSSExtract(
  devMode = false,
  options = {}
) {
  return exports.getCommonTextExtract(
    'vendors',
    devMode,
    exports.getSCSSLoaderExtract(devMode),
    options
  );
};
exports.getLibCSSExtract = function getLibCSSExtract(
  devMode = false,
  options = {}
) {
  return exports.getCommonTextExtract(
    'vendors-css',
    devMode,
    exports.getCSSLoaderExtract(devMode),
    options
  );
};
