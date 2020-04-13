'use strict';

const path = require('path');
const config = require('./env');
const SLASH_REGEX = /[\\]+/g;

const LOADER = {
  STYLE_LOADER: 'style-loader',
  CSS_LOADER: 'css-loader',
  POSTCSS_LOADER: 'postcss-loader',
  IGNORE_LOADER: 'ignore-loader',
  URL_LOADER: 'url-loader',
  FILE_LOADER: 'file-loader',
  BABEL_LOADER: 'babel-loader',
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

exports.getName = function(chunkName, ext, hashName, DEV_MODE) {
  return (
    chunkName +
    (DEV_MODE ? '.' : '-[' + (hashName ? hashName : 'contenthash') + ':9].') +
    ext
  );
};

exports.getResourceName = function(DEV_MODE) {
  return exports.getName('[path][name]', '[ext]', 'hash', DEV_MODE);
};

exports.getStyleLoaders = function(devMode, ...loaders) {
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
    if (loader === LOADER.STYLE_LOADER) {
      delete tempLoader.options.sourceMap;
    }
    temp.push(tempLoader);
  }
  // console.log(temp);
  return temp;
};

exports.resolve = function(dir) {
  return path.join(__dirname, '..', dir);
};

exports.CONTENT_PATH = exports.APP_PATH = exports.resolve('src');

exports.APP_BUILD_PATH = path.resolve(config.getOutputDir());

exports.normalizePublicPath = function(publicPath) {
  return publicPath === '.' ? '' : publicPath;
};
exports.normalizeTailSlash = function(publicPath, withSlash) {
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
exports.normalizePath = function(publicPath, withSlash) {
  return exports.normalizeTailSlash(
    exports.normalizePublicPath(publicPath),
    withSlash,
  );
};
exports.getPublicPath = function() {
  return exports.normalizeTailSlash(
    exports.normalizePublicPath(
      path.join(config.getAppPrefix(), config.getStaticPrefix()),
    ),
    config.isPrefixTailSlashEnabled(),
  );
};
exports.isWindows = function() {
  return process.platform === 'win32';
};
exports.replaceBackwardSlash = function(str) {
  return str.replace(SLASH_REGEX, '/');
};
exports.getCSSLoaderExtract = function(devMode = false) {
  return {
    use: exports.getStyleLoaders(
      devMode,
      LOADER.CSS_LOADER,
      LOADER.POSTCSS_LOADER,
    ),
    fallback: LOADER.STYLE_LOADER,
  };
};

exports.getCSSLoader = function(
  modules,
  importLoaders = 1,
  localIdentName = '[name]_[local]-[hash:base64:5]',
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

exports.getPostCSSLoader = function() {
  return {
    loader: LOADER.POSTCSS_LOADER,
  };
};

let MiniCssExtractPlugin;

exports.getAllStyleRelatedLoaders = function(
  DEV_MODE,
  isHMREnabled,
  isCSSModules,
  cssModulesIndent,
  isSSR,
  isSSREnabled,
) {
  let styleLoader = LOADER.STYLE_LOADER;
  if (!DEV_MODE || isSSREnabled) {
    if (!MiniCssExtractPlugin) {
      MiniCssExtractPlugin = require('mini-css-extract-plugin');
    }
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
      use: exports.getStyleLoaders(DEV_MODE, styleLoader, LOADER.CSS_LOADER),
    },
    {
      //app css code should check the CSS MODULES config
      test: /\.css$/,
      include: exports.resolve('src'),
      use: exports.getStyleLoaders(
        DEV_MODE,
        styleLoader,
        exports.getCSSLoader(isCSSModules, 1, cssModulesIndent),
        exports.getPostCSSLoader(),
      ),
    },
  ];
};

exports.getImageLoader = function(devMode, context) {
  return {
    test: /\.(png|jpe?g|gif|svg)$/,
    use: [
      {
        loader: LOADER.URL_LOADER,
        options: {
          context,
          name: exports.getResourceName(devMode),
          limit: 4096,
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
    loader: LOADER.FILE_LOADER,
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
      loader: LOADER.BABEL_LOADER,
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
      assets: exports.resolve('src/assets'),
      style: exports.resolve('src/style'),
      ...customAlias,
    },
  };
};
