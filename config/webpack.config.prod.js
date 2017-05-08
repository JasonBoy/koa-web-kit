'use strict';

const del = require('del');
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

del.sync('./build/app');

module.exports = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: config.getStaticAssetsEndpoint() + config.getAppPrefix() + config.getStaticPrefix(),
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
  plugins: [
    new webpack.DefinePlugin({
      'DEV_MODE': false,
      'process.env.NODE_ENV': JSON.stringify(config.getNodeEnv()),
    }),
    libCSSExtract,
    scssExtract,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        dead_code: true,
        drop_debugger: true,
      },
      mangle: true
    })
  ],
});