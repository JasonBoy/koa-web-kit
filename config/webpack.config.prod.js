'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const APP_PATH = utils.APP_PATH;

const libCSSExtract = new ExtractTextPlugin(utils.getName('common', 'css', 'contenthash', false));
const scssExtract = new ExtractTextPlugin(utils.getName('[name]', 'css', 'contenthash', false));
const scssExtracted = scssExtract.extract(utils.getStyleLoaders('css-loader', 'postcss-loader', 'sass-loader', false));

module.exports = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: config.getStaticAssetsEndpoint() +
      utils.normalizeTailSlash(
        utils.normalizePublicPath(
          path.join(config.getAppPrefix(), config.getStaticPrefix())
        )
        , config.isPrefixTailSlashEnabled()
      ),
    filename: utils.getName('[name]', 'js', '', false),
    chunkFilename: '[name]-[chunkhash].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: APP_PATH,
        // exclude: /node_modules/,
        exclude: [/node_modules/, /content\/scss\/bootstrap\.scss$/],
        use: scssExtracted
      },
      {
        test: /content\/scss\/bootstrap\.scss$/,
        use: libCSSExtract.extract(utils.getStyleLoaders('css-loader', 'sass-loader', false))
      },
      {
        test: /\.css$/,
        use: libCSSExtract.extract(utils.getStyleLoaders('css-loader', false))
      },
    ]
  },
  devtool: false,
  stats: 'errors-only',
  plugins: [
    libCSSExtract,
    scssExtract,
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      compress: {
        warnings: false,
        drop_console: true,
        dead_code: true,
        drop_debugger: true,
      },
      mangle: true
    }),
  ],
});