'use strict';

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();
const isSSREnabled = config.isSSREnabled();

const scssExtract = utils.getSCSSExtract(false, {
  allChunks: true,
});
const libSCSSExtract = utils.getLibSCSSExtract(false);
const libCSSExtract = utils.getLibCSSExtract(false, {
  allChunks: true,
});

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: config.getStaticAssetsEndpoint() + utils.getPublicPath(),
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
    libSCSSExtract.plugin,
    libCSSExtract.plugin,
    scssExtract.plugin,
    new webpack.HashedModuleIdsPlugin(),
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

if (!isSSREnabled) {
  webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
}

if (isBundleAnalyzerEnabled) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

// console.log(webpackConfig);

module.exports = webpackConfig;
