'use strict';

const path = require('path');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./env');
const SLASH_REGEX = /[\\]+/g;

const LOADER = {
  STYLE_LOADER: 'style-loader',
  CSS_LOADER: 'css-loader',
  SASS_LOADER: 'sass-loader',
  POSTCSS_LOADER: 'postcss-loader',
  IGNORE_LOADER: 'ignore-loader',
};

const ENTRY_NAME = {
  APP: 'main',
  VENDORS: 'vendors',
  RUNTIME: 'runtime',
  APP_JS: 'main.js',
  VENDORS_JS: 'vendors.js',
  RUNTIME_JS: 'runtime.js',
};

exports.ENTRY_NAME = ENTRY_NAME;
exports.LOADER = LOADER;

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

exports.getStyleLoaders = function getStyleLoaders(devMode, ...loaders) {
  const temp = [];
  for (let i = 0, length = loaders.length; i < length; i++) {
    let loader = loaders[i];
    const loaderOptions = loader.options || {};
    if (loader.loader) {
      loader = loader.loader;
    }
    let tempLoader = {
      loader,
      options: {
        sourceMap: devMode,
        ...loaderOptions,
      },
    };
    if (typeof loader === 'string' && loader.startsWith('sass')) {
      tempLoader.options.outputStyle = 'compressed';
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
  return exports.getStyleLoaders.apply(undefined, [devMode, ...loaders]);
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
      devMode,
      LOADER.CSS_LOADER,
      LOADER.POSTCSS_LOADER
    ),
    fallback: LOADER.STYLE_LOADER,
  };
};

exports.getCSSLoader = function getCSSLoader(
  modules,
  importLoaders = 1,
  localIdentName = '[name]_[local]-[hash:base64:5]'
) {
  if (!modules) {
    return LOADER.CSS_LOADER;
  }
  const temp = {
    loader: LOADER.CSS_LOADER,
    options: {
      modules,
      importLoaders,
      localIdentName,
    },
  };
  if (modules) {
    temp.options.camelCase = 'dashes';
  }
  return temp;
};

exports.getAllStyleRelatedLoaders = function(
  DEV_MODE,
  isHMREnabled,
  isCSSModules,
  cssModulesIndent,
  isSSR,
  isSSREnabled
) {
  let styleLoader = LOADER.STYLE_LOADER;
  if (!DEV_MODE || isSSREnabled) {
    styleLoader = MiniCssExtractPlugin.loader;
  } else {
    if (isHMREnabled) {
      styleLoader = LOADER.STYLE_LOADER;
    }
  }
  if (isSSR) {
    styleLoader = LOADER.IGNORE_LOADER;
  }
  return [
    {
      //just import css, without doing CSS MODULES stuff when it's from 3rd libs
      test: /\.css$/,
      include: /node_modules/,
      // use: [styleLoader, LOADER.CSS_LOADER],
      use: exports.getStyleLoaders(DEV_MODE, styleLoader, LOADER.CSS_LOADER),
    },
    {
      //app css code should check the CSS MODULES config
      test: /\.css$/,
      include: exports.resolve('src'),
      /*use: [
        styleLoader,
        exports.getCSSLoader(isCSSModules, 1, cssModulesIndent),
        LOADER.POSTCSS_LOADER,
      ],*/
      use: exports.getStyleLoaders(
        DEV_MODE,
        styleLoader,
        exports.getCSSLoader(isCSSModules, 1, cssModulesIndent),
        exports.getPostCSSLoader()
      ),
    },
    {
      //app scss/sass code should check the CSS MODULES config
      test: /\.(sa|sc)ss$/,
      include: /node_modules|vendors/,
      /*use: [
        styleLoader,
        exports.getCSSLoader(false),
        LOADER.POSTCSS_LOADER,
        LOADER.SASS_LOADER,
      ],*/
      use: exports.getStyleLoaders(
        DEV_MODE,
        styleLoader,
        exports.getCSSLoader(false),
        exports.getPostCSSLoader(),
        LOADER.SASS_LOADER
      ),
    },
    {
      //app scss/sass code should check the CSS MODULES config
      test: /\.(sa|sc)ss$/,
      exclude: /node_modules|vendors/,
      /*use: [
        styleLoader,
        exports.getCSSLoader(isCSSModules, 2, cssModulesIndent),
        LOADER.POSTCSS_LOADER,
        LOADER.SASS_LOADER,
      ],*/
      use: exports.getStyleLoaders(
        DEV_MODE,
        styleLoader,
        exports.getCSSLoader(isCSSModules, 2, cssModulesIndent),
        exports.getPostCSSLoader(),
        LOADER.SASS_LOADER
      ),
    },
  ];
};

exports.getImageLoader = function(devMode, context) {
  return {
    test: /\.(png|jpe?g|gif|svg)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          context,
          name: exports.getResourceName(devMode),
          limit: 1024,
        },
      },
      // {
      //   loader: 'image-webpack-loader',
      //   options: {
      //     bypassOnDebug: devMode,
      //   },
      // },
    ],
  };
};
exports.getMediaLoader = function(devMode, context) {
  return {
    test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
    loader: 'file-loader',
    options: {
      context,
      name: exports.getResourceName(devMode),
      limit: 5000,
    },
  };
};
exports.getBabelLoader = function(cache) {
  return {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: cache,
      },
    },
  };
};
exports.getWebpackResolveConfig = function(customAlias = {}) {
  const appPath = exports.APP_PATH;
  return {
    modules: [appPath, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      src: appPath,
      modules: exports.resolve('src/modules'),
      components: exports.resolve('src/components'),
      ...customAlias,
    },
  };
};
exports.getPostCSSLoader = function() {
  return {
    loader: LOADER.POSTCSS_LOADER,
    options: {
      plugins: [autoprefixer],
    },
  };
};
