var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: './react/main.js',
  output: {
    path: path.join(__dirname, 'react'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: ['uglify', 'babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: ['style', 'css?minimize', 'sass']
      }
    ]
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Hello World app',
      template: path.resolve('./react/index.html'),
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