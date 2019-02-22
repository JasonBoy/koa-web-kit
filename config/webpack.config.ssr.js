'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const config = require('./env');
const utils = require('./utils');
const nodeExternals = require('webpack-node-externals');

const DEV_MODE = config.isDevMode();
const APP_PATH = utils.APP_PATH;

const prefix = utils.normalizeTailSlash(
  utils.normalizePublicPath(
    path.join(config.getAppPrefix(), config.getStaticPrefix())
  ),
  config.isPrefixTailSlashEnabled()
);

const webpackConfig = webpackMerge(
  {},
  {
    entry: {
      main: utils.resolve('src/ssr/index.js'),
    },
    target: 'node',
    mode: DEV_MODE ? 'development' : 'production',
    output: {
      path: utils.resolve('build/node'),
      filename: '[name].js',
      libraryExport: 'default',
      libraryTarget: 'commonjs2',
    },
    externals: [
      nodeExternals({
        whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
      }),
    ],
    resolve: {
      ...utils.getWebpackResolveConfig(),
    },
    module: {
      rules: [
        utils.getBabelLoader(true),
        ...utils.getAllStyleRelatedLoaders(
          DEV_MODE,
          false,
          false,
          undefined,
          true
        ),
        utils.getImageLoader(DEV_MODE, APP_PATH),
        utils.getMediaLoader(DEV_MODE, APP_PATH),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __isBrowser__: false,
        __pathPrefix__: JSON.stringify(prefix),
      }),
      new webpack.LoaderOptionsPlugin({
        debug: DEV_MODE,
        minimize: !DEV_MODE,
        options: {
          context: APP_PATH,
        },
      }),
      // new MiniCssExtractPlugin({
      //   filename: "[name].css",
      //   chunkFilename: "[id].css"
      // }),
    ],
  }
);

module.exports = webpackConfig;
