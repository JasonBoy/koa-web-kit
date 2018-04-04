'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();

const APP_PATH = utils.APP_PATH;

const libCSSExtract = new ExtractTextPlugin({
  filename: utils.getName('common', 'css', 'contenthash', false),
  allChunks: true,
});
const scssExtract = new ExtractTextPlugin({
  filename: utils.getName('[name]', 'css', 'contenthash', false),
  allChunks: true,
});
const scssExtracted = scssExtract.extract({
  use: utils.getStyleLoaders(
    'css-loader',
    'postcss-loader',
    'sass-loader',
    false
  ),
  fallback: 'style-loader',
});
const libCSSExtracted = libCSSExtract.extract({
  use: utils.getStyleLoaders('css-loader', 'postcss-loader', false),
  fallback: 'style-loader',
});

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath:
      config.getStaticAssetsEndpoint() +
      utils.normalizeTailSlash(
        utils.normalizePublicPath(
          path.join(config.getAppPrefix(), config.getStaticPrefix())
        ),
        config.isPrefixTailSlashEnabled()
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
        use: scssExtracted,
      },
      {
        test: /content\/scss\/bootstrap\.scss$/,
        use: libCSSExtracted,
      },
      {
        test: /\.css$/,
        use: libCSSExtracted,
      },
    ],
  },
  devtool: 'hidden-source-map',
  stats: 'errors-only',
  plugins: [
    libCSSExtract,
    scssExtract,
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false,
        compress: {
          warnings: false,
          drop_console: true,
          dead_code: true,
          drop_debugger: true,
        },
        output: {
          comments: false,
          beautify: false,
        },
        mangle: true,
      },
      parallel: true,
      sourceMap: true,
    }),
  ],
});

if (isBundleAnalyzerEnabled) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
