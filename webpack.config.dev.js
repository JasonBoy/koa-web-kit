const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const bootstrapCSSExtract = new ExtractTextPlugin('bootstrap.css');
const scssExtract = new ExtractTextPlugin('[name].css');
const scssExtracted = scssExtract.extract("css?sourceMap!sass?sourceMap");

const DEV_MODE = !(process.env.NODE_ENV === 'production');
const APP_PATH = path.join(__dirname, 'src');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');

module.exports = {
  entry: {
    vendors: ['vue'],
    app: path.join(APP_PATH, 'main.js')
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
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: APP_PATH,
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-2']
        }
      },
      {
        test: /\.scss$/,
        include: APP_PATH,
        // exclude: /node_modules/,
        exclude: [/node_modules/, /content\/scss\/bootstrap\.scss$/],
        loader: scssExtracted
      },
      {
        test: /content\/scss\/bootstrap\.scss$/,
        loader: bootstrapCSSExtract.extract(['css?sourceMap', 'sass?sourceMap'])
      },
      {
        test: /\.css$/,
        loader: bootstrapCSSExtract.extract(['css?sourceMap'])
      },
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
      PROD_MODE: false,
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(), // recommanded by webpack
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors'],
      minChunks: Infinity
    }),
    bootstrapCSSExtract,
    scssExtract,
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: 'index.html',
      inject: 'body'
    })
    // ,
    // new ExtractTextPlugin("styles.css")
  ],
  resolve: {
    root: [path.resolve('./src')],
    extensions: ['', '.js', '.vue']
  },
  vue: {
    loaders: {
      sass: scssExtracted,
    },
    postcss: [
      require('autoprefixer')({
        browsers: ['last 2 versions']
      })
    ]
  },
  devtool: 'source-map'
};