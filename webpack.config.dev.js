const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const bootstrapCSSExtract = new ExtractTextPlugin('bootstrap.css');
const scssExtract = new ExtractTextPlugin('[name].css');

const DEV_MODE = !(process.env.NODE_ENV === 'production');
const APP_PATH = path.join(__dirname, 'src');
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
        loader: 'babel',
        include: APP_PATH,
        query: {
          presets: ['es2015', 'react', 'stage-1']
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: scssExtract.extract(['css?sourceMap', 'sass?sourceMap'])
      },
      // {
      //   test: /bootstrap\/scss\/\S+\.scss$/,
      //   loader: bootstrapCSSExtract.extract(['css?sourceMap', 'sass?sourceMap'])
      // },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader',
        query: {
          context: './src/content/',
          name: DEV_MODE ? '[path][name].[ext]' : '[path][name]-[hash].[ext]',
          limit: 10000,
        },
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
        query: {
          context: './src/content/',
          name: DEV_MODE ? '[path][name].[ext]?[hash]' : '[hash].[ext]',
        },
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
    bootstrapCSSExtract,
    scssExtract,
    new HtmlWebpackPlugin({
      title: 'my title',
      template: './views/index.html',
      filename: 'index.html',
      inject: 'body'
    })
    // ,
    // new ExtractTextPlugin("styles.css")
  ],
  resolve: {
    root: [path.resolve('./src')],
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
  devtool: 'source-map'
};