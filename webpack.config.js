const path = require('path');
const del = require('del');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

const config = require('./config');

const DEV_MODE = config.isDevMode();
const APP_PATH = path.join(__dirname, 'src');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');
const CONTENT_PATH = path.join(__dirname, './src');

const libCSSExtract = new ExtractTextPlugin(getName('common', 'css', 'contenthash'));
const scssExtract = new ExtractTextPlugin(getName('[name]', 'css', 'contenthash'));
const scssExtracted = scssExtract.extract(getStyleLoaders('css', 'sass'));

del.sync('./build/app');

let webpackConfig = {
  entry: {
    vendors: ['vue', 'vue-router'],
    app: path.join(APP_PATH, 'main.js')
  },
  output: {
    path: APP_BUILD_PATH,
    publicPath: (DEV_MODE ? '' : config.getStaticAssetsEndpoint()) + '/public/',
    filename: getName('[name]', 'js'),
    chunkFilename: '[name]-[chunkhash].js'
  },
  module: getModules(),
  plugins: getPlugins(),
  resolve: {
    root: [path.resolve('./src')],
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, './node_modules')],
    alias: {
      'vue': DEV_MODE ? 'vue/dist/vue': 'vue/dist/vue.min',
      'src': path.resolve(__dirname, './src'),
      'content': path.resolve(__dirname, './src/content'),
      'components': path.resolve(__dirname, './src/components'),
      'store': path.resolve(__dirname, './src/store')
    }
  },
  vue: {
    loaders: {
      sass: scssExtracted,
    },
    postcss: [
      require('autoprefixer')({
        browsers: ['last 5 versions']
      })
    ]
  },
};

if(DEV_MODE) {
  webpackConfig.devtool = 'source-map';
}

module.exports = webpackConfig;

function getName(chunkName, ext, hashName) {
  return chunkName + (DEV_MODE ? '.' : '-[' + (hashName ? hashName : 'chunkhash') + ':9].') + ext;
}
function getResourceName() {
  return getName('[path][name]', '[ext]', 'hash');
}
function getStyleLoaders() {
  const temp = [];
  for(let i = 0, length = arguments.length; i < length; i++) {
    temp.push(arguments[i] + (DEV_MODE ? '?sourceMap' : ''));
  }
  return temp;
}

function getPlugins() {
  const plugins = [
    new webpack.DefinePlugin({
      // VERSION: JSON.stringify('1.0.0'),
      DEV_MODE: DEV_MODE,
      'process.env': {
        NODE_ENV: JSON.stringify(config.getNodeEnv())
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new WebpackMd5Hash(),
    new webpack.optimize.CommonsChunkPlugin({
      names: 'vendors',
      minChunks: Infinity
    }),
    libCSSExtract,
    scssExtract,
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: 'index.html',
      inject: 'body',
      chunksSortMode: 'dependency'
    }),
    new ChunkManifestPlugin({
      filename: '../manifest.json',
      manifestVariable: 'webpackManifest'
    }),
  ];
  if(DEV_MODE) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  } else {
    plugins.push(new webpack.NoErrorsPlugin());
    //add uglify plugin
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        dead_code: true,
        drop_debugger: true,
      },
      comments: /eju/,
      mangle: true
    }));
  }

  return plugins;
}

function getModules() {
  const imageLoader = {
    test: /\.(png|jpe?g|gif|svg)$/,
    loaders: [
      `url?context=${CONTENT_PATH}&name=${getResourceName()}&limit=5000`,
    ],
  };
  if(!DEV_MODE) {
    imageLoader.loaders.push('image-webpack');
  }

  const module = {
    // preLoaders: [
    //   {
    //     test: /\.vue$/,
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
        exclude: /node_modules/,
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
        loader: libCSSExtract.extract(getStyleLoaders('css', 'sass'))
      },
      {
        test: /\.css$/,
        loader: libCSSExtract.extract(getStyleLoaders('css'))
      },
      imageLoader,
      {
        test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
        loader: 'file',
        query: {
          context: CONTENT_PATH,
          name: getResourceName(),
          limit: 5000,
        },
      }
    ]
  };
  if(DEV_MODE) {
    module.noParse = [/^vue$/];
  }
  return module;
}