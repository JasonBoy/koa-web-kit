'use strict';

const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');
const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();
const isSSREnabled = config.isSSREnabled();
const isCSSModules = config.isCSSModules();

const webpackConfig = merge(baseWebpackConfig, {
  output: {
    publicPath: config.getStaticAssetsEndpoint() + utils.getPublicPath(),
    filename: utils.getName('[name]', 'js', '', false),
  },
  module: {
    rules: [
      ...utils.getAllStyleRelatedLoaders(
        false,
        false,
        isCSSModules,
        '[local]-[hash:base64:5]',
      ),
    ],
  },
  mode: 'production',
  // devtool: 'hidden-source-map',
  stats: { children: false, warnings: false },
  plugins: [
    new MiniCssExtractPlugin({
      filename: utils.getName('[name]', 'css', 'contenthash', false),
    }),
  ],
  //new in webpack4
  optimization: {
    namedModules: false,
    // runtimeChunk: { name: utils.ENTRY_NAME.VENDORS },
    runtimeChunk: 'single',
    noEmitOnErrors: true, // NoEmitOnErrorsPlugin
    concatenateModules: !isSSREnabled, //ModuleConcatenationPlugin
    splitChunks: {
      // name: false,
      automaticNameMaxLength: 30,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/i,
          name: utils.ENTRY_NAME.VENDORS,
          chunks: 'initial',
        },
      },
    },
    minimizer: [
      new TerserWebpackPlugin({
        extractComments: false,
        parallel: true,
        sourceMap: false,
        terserOptions: {
          warnings: false,
          // ecma: 2015,
          compress: {
            warnings: false,
            drop_console: true,
            dead_code: true,
            drop_debugger: true,
          },
          output: {
            comments: false,
            // beautify: false,
          },
          mangle: true,
        },
      }),
    ],
  },
});

// removed in webpack4
// if (!isSSREnabled) {
//   webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
// }

if (isBundleAnalyzerEnabled) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

// console.log('webpackConfig.output.publicPath: ', webpackConfig.output.publicPath);

// console.log(webpackConfig);

module.exports = webpackConfig;
