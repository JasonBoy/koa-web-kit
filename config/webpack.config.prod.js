'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();

const scssExtract = utils.getSCSSExtract(false, {
  allChunks: true,
});
const libSCSSExtract = utils.getLibSCSSExtract(false);
const libCSSExtract = utils.getLibCSSExtract(false, {
  allChunks: true,
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
        test: /scss\/vendors\.scss$/,
        use: libSCSSExtract.loader,
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/, /scss\/vendors\.scss$/],
        use: scssExtract.loader,
      },
      {
        test: /\.css$/,
        use: libCSSExtract.loader,
      },
    ],
  },
  devtool: 'hidden-source-map',
  stats: 'errors-only',
  plugins: [
    libSCSSExtract.pulgin,
    libCSSExtract.pulgin,
    scssExtract.pulgin,
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
