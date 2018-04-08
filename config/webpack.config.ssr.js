'use strict';

const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
const APP_PATH = utils.APP_PATH;

const webpackConfig = {
  entry: {
    ssr: utils.resolve('ssr/index.js'),
  },
  output: {
    path: utils.resolve('build/node'),
    filename: `[name]${DEV_MODE ? '' : '.min'}.js`,
    library: 'SSR',
    libraryExport: 'default',
    libraryTarget: 'commonjs2',
  },
  // target: 'web',
  // externals: [nodeExternals()],
  resolve: {
    modules: [APP_PATH, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      src: APP_PATH,
      content: utils.resolve('src/content'),
      components: utils.resolve('src/components'),
      store: utils.resolve('src/store'),
      'lodash-es': 'lodash',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: DEV_MODE,
      minimize: !DEV_MODE,
      options: {
        context: APP_PATH,
      },
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   // names: ['vendors', 'manifest'],
    //   names: ['manifest'],
    //   minChunks: Infinity
    // }),
  ],
};

if (!DEV_MODE) {
  webpackConfig.plugins.push(new MinifyPlugin({}, {}));
}

module.exports = webpackConfig;
