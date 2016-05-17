const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_PATH = path.join(__dirname, 'app');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');

module.exports = {
  entry: {
    vendors: ['react', 'react-dom'],
    app: path.join(APP_PATH, 'index.jsx')
  },
  output: {
    path: path.join(APP_BUILD_PATH, '[hash]'),
    publicPath: '/public/',
    filename: '[name]-[chunkhash:8].js'
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
    new webpack.DefinePlugin({
      VERSION: JSON.stringify('1.0.0'),
      PROD_MODE: false
    }),
    new HtmlWebpackPlugin({
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
    }),
    new webpack.EnvironmentPlugin([
      'NODE_ENV'
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      minChunks: Infinity
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};