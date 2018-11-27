'use strict';

const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const PreloadWebpackPlugin = require('preload-webpack-plugin');

const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');
const LOADER = utils.LOADER;

const isBundleAnalyzerEnabled = config.isBundleAnalyzerEnabled();
const isSSREnabled = config.isSSREnabled();
const isCSSModules = config.isCSSModules();

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: config.getStaticAssetsEndpoint() + utils.getPublicPath(),
    filename: utils.getName('[name]', 'js', '', false),
    chunkFilename: '[name]-[chunkhash:9].chunk.js',
  },
  module: {
    rules: [
      {
        //just import css, without doing CSS MODULES stuff when it's from 3rd libs
        test: /\.css$/,
        include: /node_modules/,
        use: [MiniCssExtractPlugin.loader, LOADER.CSS_LOADER],
      },
      {
        //app css code should check the CSS MODULES config
        test: /\.css$/,
        include: utils.resolve('src'),
        use: [
          MiniCssExtractPlugin.loader,
          utils.getCSSLoader(isCSSModules, 1, '[hash:base64:5]'),
          LOADER.POSTCSS_LOADER,
        ],
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          utils.getCSSLoader(isCSSModules, 2, '[hash:base64:5]'),
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
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
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
        sourceMap: false,
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
