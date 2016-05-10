const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cssExtract = new ExtractTextPlugin('styles.css');
const scssExtract = new ExtractTextPlugin('main.css');

const APP_PATH = path.join(__dirname, 'app');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');

module.exports = {
  entry: {
    vendors: ['react', 'react-dom'],
    app: path.join(APP_PATH, 'index.jsx')
  },
  output: {
    path: APP_BUILD_PATH,
    publicPath: '/public/',
    filename: '[name].js'
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
        loader: scssExtract.extract(['css?sourceMap', 'sass?sourceMap'])
        // loaders: [
        //   // 'isomorphic-style-loader',
        //   'style',
        //   'css?sourceMap',
        //   'sass?sourceMap'
        // ]
      },
      {
        test: /\.css$/,
        loader: cssExtract.extract(['css'])
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify('1.0.0'),
      PROD_MODE: false
    }),
    new webpack.optimize.OccurenceOrderPlugin(), // recommanded by webpack
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin([
      'NODE_ENV'
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors'],
      minChunks: Infinity
    }),
    cssExtract,
    scssExtract,
    new HtmlWebpackPlugin({
      title: 'my title',
      template: './app/views/index.html',
      filename: 'index.html',
      inject: 'body'
    })
    // ,
    // new ExtractTextPlugin("styles.css")
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