var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');

var REACT_PATH = path.join(__dirname, 'react');

module.exports = {
  entry: './react/main.js',
  output: {
    path: path.join(__dirname, 'react'),
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: REACT_PATH
      },
      {
        test: /\.scss$/,
        loader: ['style', 'css?sourceMap', 'sass?sourceMap']
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(), // recommanded by webpack
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin(), // recommanded by webpack
    new HtmlwebpackPlugin({
      title: 'Hello World app',
      template: path.resolve('./react/index.html'),
      // chunks: ['app', 'vendors'],
      inject: 'body'
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  // devServer: {
  //   historyApiFallback: true,
  //   hot: true,
  //   inline: true,
  //   progress: true
  //   // ,
  //   // proxy: {
  //   //   '/api/*': {
  //   //     target: 'http://localhost:5000',
  //   //     secure: false
  //   //   }
  //   // }
  // },
  devtool: 'eval-source-map'
};