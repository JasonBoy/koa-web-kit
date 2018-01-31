'use strict';

const path = require('path');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const APP_PATH = utils.APP_PATH;
const isHMREnabled = config.isHMREnabled();

const libCSSExtract = new ExtractTextPlugin(utils.getName('common', 'css', 'contenthash', true));
const scssExtract = new ExtractTextPlugin(utils.getName('[name]', 'css', 'contenthash', true));
const scssExtracted = scssExtract.extract(utils.getStyleLoaders('css-loader', 'postcss-loader', 'sass-loader', true));

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: isHMREnabled
      ? '/'
      : utils.normalizeTailSlash(
        utils.normalizePublicPath(
          path.join(config.getAppPrefix(), config.getStaticPrefix())
        ), config.isPrefixTailSlashEnabled()),
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: APP_PATH,
        // exclude: /node_modules/,
        exclude: [/node_modules/, /content\/scss\/bootstrap\.scss$/],
        use: isHMREnabled
          ? utils.getStyleLoaders('style-loader', 'css-loader', 'postcss-loader', 'sass-loader', true)
          : scssExtracted
      },
      {
        test: /content\/scss\/bootstrap\.scss$/,
        use: isHMREnabled
          ? utils.getStyleLoaders('style-loader', 'css-loader', 'postcss-loader', 'sass-loader', true)
          : libCSSExtract.extract(utils.getStyleLoaders('css-loader', 'sass-loader', true))
      },
      {
        test: /\.css$/,
        use: isHMREnabled
          ?  utils.getStyleLoaders('style-loader', 'css-loader', true)
          : libCSSExtract.extract(utils.getStyleLoaders('css-loader', true))
      },
    ]
  },
  devtool: 'source-map',
  plugins: [],
});

if(!isHMREnabled) {
  webpackConfig.plugins.push(libCSSExtract);
  webpackConfig.plugins.push(scssExtract);
}

module.exports = webpackConfig;