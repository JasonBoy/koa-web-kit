'use strict';

const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const isHMREnabled = config.isHMREnabled();

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: isHMREnabled ? '/' : utils.getPublicPath(),
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isHMREnabled ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [],
});

// optimization new in webpack4
if (!isHMREnabled) {
  webpackConfig.optimization = {
    namedModules: true,
    runtimeChunk: 'single',
  };
}

if (!isHMREnabled) {
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  );
  // webpackConfig.plugins.push(libCSSExtract.plugin);
  // webpackConfig.plugins.push(libSCSSExtract.plugin);
  // webpackConfig.plugins.push(scssExtract.plugin);
}

console.log(
  'webpackConfig.output.publicPath: ',
  webpackConfig.output.publicPath
);
// console.log(webpackConfig);
// console.log(webpackConfig.plugins);
module.exports = webpackConfig;
