const path = require('path');
const del = require('del');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const WebpackMd5Hash = require('webpack-md5-hash');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

const config = require('./config');

const DEV_MODE = config.isDevMode();
const APP_PATH = path.join(__dirname, 'src');
const APP_BUILD_PATH = path.join(__dirname, 'build', 'app');
const CONTENT_PATH = path.join(__dirname, './src');

const libCSSExtract = new ExtractTextPlugin(getName('common', 'css', 'contenthash'));
const scssExtract = new ExtractTextPlugin(getName('[name]', 'css', 'contenthash'));
const scssExtracted = scssExtract.extract(getStyleLoaders('css-loader', 'sass-loader'));

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
    modules: [
      path.resolve('./src'),
      'node_modules',
    ],
    extensions: ['.js', '.vue'],
    alias: {
      'vue': DEV_MODE ? 'vue/dist/vue': 'vue/dist/vue.min',
      'src': path.resolve(__dirname, './src'),
      'content': path.resolve(__dirname, './src/content'),
      'components': path.resolve(__dirname, './src/components'),
      'store': path.resolve(__dirname, './src/store')
    }
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
    const tempLoader = {
      loader: arguments[i],
      options: {},
    };
    if(DEV_MODE) {
      tempLoader.options.sourceMap = '';
    }
    temp.push(tempLoader);
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
    new webpack.LoaderOptionsPlugin({
      debug: DEV_MODE,
      options: {
        context: CONTENT_PATH,
      },
    }),
    // new WebpackMd5Hash(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors', 'manifest'],
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
    plugins.push(new webpack.NoEmitOnErrorsPlugin());
  } else {
    //add uglify plugin
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        dead_code: true,
        drop_debugger: true,
      },
      mangle: true
    }));
  }

  return plugins;
}

function getModules() {
  const imageLoader = {
    test: /\.(png|jpe?g|gif|svg)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          context: CONTENT_PATH,
          name: getResourceName(),
          limit: 5000,
        }
      },
    ],
  };
  if(!DEV_MODE) {
    imageLoader.use.push({loader: 'image-webpack-loader'});
  }

  const module = {
    rules: [
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            loaders: {
              sass: scssExtracted,
            },
            postcss: [
              require('autoprefixer')({
                browsers: ['last 5 versions']
              })
            ]
          }
        }],
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        include: APP_PATH,
        // exclude: /node_modules/,
        exclude: [/node_modules/, /content\/scss\/bootstrap\.scss$/],
        use: scssExtracted
      },
      {
        test: /content\/scss\/bootstrap\.scss$/,
        use: libCSSExtract.extract(getStyleLoaders('css-loader', 'sass-loader'))
      },
      {
        test: /\.css$/,
        use: libCSSExtract.extract(getStyleLoaders('css-loader'))
      },
      imageLoader,
      {
        test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
        options: {
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
