'use strict';

const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const config = require('./env');
const utils = require('./utils');


const DEV_MODE = config.isDevMode();
const APP_PATH = utils.APP_PATH;
const CONTENT_PATH = APP_PATH;

module.exports = {
  entry: {
    app: utils.resolve('app'),
  },
  output: {
    path: utils.resolve('./'),
    filename: '[name].min.js',
  },
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    // modules: [
    //   APP_PATH,
    //   'node_modules',
    // ],
    extensions: ['.js', '.json'],
  },
  module: {
    // rules: [
    //   {
    //     test: /\.js$/,
    //     exclude: /node_modules/,
    //     use: {
    //       loader: 'babel-loader',
    //       options: {
    //         cacheDirectory: true,
    //       }
    //     }
    //   },
    // ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: DEV_MODE,
      minimize: !DEV_MODE,
      options: {
        context: CONTENT_PATH,
      },
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   // names: ['vendors', 'manifest'],
    //   names: ['manifest'],
    //   minChunks: Infinity
    // }),
    new MinifyPlugin({}, {}),
  ],
};
