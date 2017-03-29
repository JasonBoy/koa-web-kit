'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
const APP_PATH = utils.APP_PATH;
const CONTENT_PATH = APP_PATH;
const APP_BUILD_PATH = utils.APP_BUILD_PATH;



module.exports = {
  entry: {
    vendors: ['react', 'react-dom'],
    app: path.join(APP_PATH, 'index.js'),
  },
  output: {
    path: APP_BUILD_PATH,
    publicPath: '/public/',
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  resolve: {
    modules: [
      APP_PATH,
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'src': APP_PATH,
      'content': utils.resolve('src/content'),
      'components': utils.resolve('src/components'),
      'store': utils.resolve('src/store'),
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              context: CONTENT_PATH,
              name: utils.getResourceName(DEV_MODE),
              limit: 5000,
            }
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
        options: {
          context: CONTENT_PATH,
          name: utils.getResourceName(DEV_MODE),
          limit: 5000,
        },
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: DEV_MODE,
      minimize: !DEV_MODE,
      options: {
        context: CONTENT_PATH,
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors', 'manifest'],
      minChunks: Infinity
    }),
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: 'index.html',
      inject: 'body',
      chunksSortMode: 'dependency'
    }),
    new ManifestPlugin(),
  ],
};
