const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_PATH = path.join(__dirname, 'app');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');

module.exports = {
  entry: path.join(APP_PATH, 'index.jsx'),
  output: {
    path: APP_BUILD_PATH,
    publicPath: '/public/',
    filename: 'bundle.js'
  },
  module: {
    // preLoaders: [
    //   {
    //     test: /\.jsx?$/,
    //     loaders: ['eslint'],
    //     exclude: /node_modules/
    //   }
    // ],
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: APP_PATH
      },
      {
        test: /\.scss$/,
        loaders: [
          // 'isomorphic-style-loader',
          'style',
          'css?sourceMap',
          'sass?sourceMap'
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(), // recommanded by webpack
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin(), // recommanded by webpack
    new HtmlWebpackPlugin({
      title: 'Hello World app',
      template: path.resolve('./app/views/index.html'),
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