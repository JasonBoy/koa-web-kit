'use strict';

const path = require('path');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const APP_PATH = utils.APP_PATH;
const isHMREnabled = config.isHMREnabled();

const libCSSExtract = new ExtractTextPlugin(
  utils.getName('common', 'css', 'contenthash', true)
);
const scssExtract = new ExtractTextPlugin(
  utils.getName('[name]', 'css', 'contenthash', true)
);
const scssExtracted = scssExtract.extract(
  utils.getStyleLoaders('css-loader', 'postcss-loader', 'sass-loader', true)
);

const libCSSExtracted = libCSSExtract.extract(
  // utils.getStyleLoaders('css-loader', 'postcss-loader', true)
  {
    use: utils.getStyleLoaders('css-loader', 'postcss-loader', true),
    fallback: 'style-loader',
  }
);

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: isHMREnabled
      ? '/'
      : utils.normalizeTailSlash(
          utils.normalizePublicPath(
            path.join(config.getAppPrefix(), config.getStaticPrefix())
          ),
          config.isPrefixTailSlashEnabled()
        ),
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
          ? utils.getStyleLoaders(
              'style-loader',
              'css-loader',
              'postcss-loader',
              'sass-loader',
              true
            )
          : scssExtracted,
      },
      {
        test: /\.css$/,
        include: [APP_PATH, /node_modules/],
        use: isHMREnabled
          ? utils.getStyleLoaders(
              'style-loader',
              'css-loader',
              'postcss-loader',
              true
            )
          : libCSSExtracted,
      },
    ],
  },
  devtool: isHMREnabled ? 'eval' : 'source-map',
  plugins: [],
});

if (!isHMREnabled) {
  webpackConfig.plugins.push(new DashboardPlugin());
  webpackConfig.plugins.push(libCSSExtract);
  webpackConfig.plugins.push(scssExtract);
}
// console.log(webpackConfig.plugins);
module.exports = webpackConfig;
