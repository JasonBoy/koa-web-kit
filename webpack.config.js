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
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
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
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
    // ,
    // proxy: {
    //   '/api/*': {
    //     target: 'http://localhost:5000',
    //     secure: false
    //   }
    // }
  },
  devtool: 'eval-source-map'
};