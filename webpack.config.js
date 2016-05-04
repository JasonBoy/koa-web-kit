const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_PATH = path.join(__dirname, 'app');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');

module.exports = {
  entry: path.join(APP_PATH, 'index.jsx'),
  output: {
    path: APP_BUILD_PATH,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: [
          'style',
          'css?minimize',
          'sass'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hello World app',
      template: path.resolve('./app/views/index.html'),
      // chunks: ['app', 'vendors'],
      inject: 'body'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        dead_code: true,
        drop_debugger: true
      }
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};