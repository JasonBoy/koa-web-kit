'use strict';

const MinifyPlugin = require('babel-minify-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
// const APP_PATH = utils.APP_PATH;

const webpackConfig = {
  entry: {
    app: utils.resolve('app'),
  },
  output: {
    path: utils.resolve('build/node'),
    filename: `[name]${DEV_MODE ? '' : '.min'}.js`,
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
  plugins: [],
};

if (!DEV_MODE) {
  webpackConfig.plugins.push(new MinifyPlugin({}, {}));
}

module.exports = webpackConfig;
