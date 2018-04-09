'use strict';

const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');
const nodeExternals = require('webpack-node-externals');

const DEV_MODE = config.isDevMode();
const APP_PATH = utils.APP_PATH;

const libCSSExtract = new ExtractTextPlugin({
  filename: utils.getName('common', 'css', 'contenthash', true),
  allChunks: true,
});
const scssExtract = new ExtractTextPlugin({
  filename: utils.getName('[name]', 'css', 'contenthash', true),
  allChunks: true,
});
const scssExtracted = scssExtract.extract({
  use: utils.getStyleLoaders(
    'css-loader',
    'postcss-loader',
    'sass-loader',
    true
  ),
  fallback: 'style-loader',
});

const libCSSExtracted = libCSSExtract.extract({
  use: utils.getStyleLoaders('css-loader', 'postcss-loader', true),
  fallback: 'style-loader',
});

const webpackConfig = webpackMerge(
  {},
  {
    entry: {
      ssr: utils.resolve('ssr/index.js'),
    },
    target: 'node',
    output: {
      path: utils.resolve('build/node'),
      filename: `[name]${DEV_MODE ? '' : '.min'}.js`,
      libraryExport: 'default',
      libraryTarget: 'commonjs2',
    },
    // target: 'web',
    externals: [nodeExternals()],
    resolve: {
      modules: [APP_PATH, 'node_modules'],
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        src: APP_PATH,
        content: utils.resolve('src/content'),
        components: utils.resolve('src/components'),
        store: utils.resolve('src/store'),
        'lodash-es': 'lodash',
      },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
        {
          test: /\.scss$/,
          include: APP_PATH,
          // exclude: /node_modules/,
          exclude: [/node_modules/, /content\/scss\/bootstrap\.scss$/],
          use: utils.getStyleLoaders(
            // 'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader',
            true
          ),
        },
        {
          test: /\.css$/,
          // include: [APP_PATH, /node_modules/],
          use: utils.getStyleLoaders(
            // 'style-loader',
            'css-loader',
            'postcss-loader',
            true
          ),
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                context: APP_PATH,
                name: utils.getResourceName(DEV_MODE),
                limit: 1024,
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
          loader: 'file-loader',
          options: {
            context: APP_PATH,
            name: utils.getResourceName(DEV_MODE),
            limit: 5000,
          },
        },
      ],
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        debug: DEV_MODE,
        minimize: !DEV_MODE,
        options: {
          context: APP_PATH,
        },
      }),
      // new webpack.IgnorePlugin(/\.(scss|css|svg|png)$/),
      // new webpack.optimize.CommonsChunkPlugin({
      //   // names: ['vendors', 'manifest'],
      //   names: ['manifest'],
      //   minChunks: Infinity
      // }),
    ],
  }
);

// if (!DEV_MODE) {
//   webpackConfig.plugins.push(new MinifyPlugin({}, {}));
// }

module.exports = webpackConfig;
