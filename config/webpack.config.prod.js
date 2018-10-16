'use strict';

const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const PreloadWebpackPlugin = require('preload-webpack-plugin');

const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');
const LOADER = utils.LOADER;

const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();
const isSSREnabled = config.isSSREnabled();

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: config.getStaticAssetsEndpoint() + utils.getPublicPath(),
    filename: utils.getName('[name]', 'js', '', false),
    chunkFilename: '[name]-[chunkhash:9].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          LOADER.CSS_LOADER,
          LOADER.POSTCSS_LOADER,
          LOADER.SASS_LOADER,
        ],
      },
    ],
  },
  mode: 'production',
  // devtool: 'hidden-source-map',
  stats: { children: false, warnings: false },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]-[hash:9].css',
      chunkFilename: '[id]-[hash:9].css',
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      include: 'initial',
    }),
    // new PreloadWebpackPlugin({
    //   rel: 'prefetch',
    //   include: 'asyncChunks',
    // }),
  ],
  //new in webpack4
  optimization: {
    namedModules: false,
    runtimeChunk: { name: utils.ENTRY_NAME.VENDORS },
    // runtimeChunk: 'single',
    noEmitOnErrors: true, // NoEmitOnErrorsPlugin
    concatenateModules: !isSSREnabled, //ModuleConcatenationPlugin
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/i,
          name: utils.ENTRY_NAME.VENDORS,
          chunks: 'all',
        },
      },
    },
    minimizer: [new OptimizeCSSAssetsPlugin({})],
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
