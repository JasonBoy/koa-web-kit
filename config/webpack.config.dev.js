'use strict';

const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');
const isHMREnabled = config.isHMREnabled();
const isCSSModules = config.isCSSModules();

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: isHMREnabled ? '/' : utils.getPublicPath(),
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      ...utils.getAllStyleRelatedLoaders(
        true,
        isHMREnabled,
        isCSSModules,
        undefined,
        false,
        !isHMREnabled
      ),
    ],
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
  stats: { children: false },
  plugins: [new ErrorOverlayPlugin()],
});

// optimization new in webpack4
if (!isHMREnabled) {
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  );
  webpackConfig.optimization = {
    namedModules: true,
    runtimeChunk: 'single',
  };
}

// console.log(
//   'webpackConfig.output.publicPath: ',
//   webpackConfig.output.publicPath
// );
// console.log(webpackConfig);
// console.log(webpackConfig.plugins);
module.exports = webpackConfig;
