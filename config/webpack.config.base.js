'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const InlineChunkWebpackPlugin = require('html-webpack-inline-chunk-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
const isHMREnabled = config.isHMREnabled();
const APP_PATH = utils.APP_PATH;
const CONTENT_PATH = APP_PATH;
const APP_BUILD_PATH = utils.APP_BUILD_PATH;

const defaultPrefix = config.getApiEndPoints().defaultPrefix;

const appPrefix = utils.normalizeTailSlash(
  config.getAppPrefix(),
  config.isPrefixTailSlashEnabled()
);
const prefix = utils.normalizeTailSlash(
  utils.normalizePublicPath(
    path.join(config.getAppPrefix(), config.getStaticPrefix())
  ),
  config.isPrefixTailSlashEnabled()
);

const appIndex = path.join(APP_PATH, 'index.js');

let entry = undefined;
if (isHMREnabled) {
  entry = [appIndex];
} else {
  entry = {
    app: appIndex,
  };
}

const webpackConfig = {
  entry,
  output: {
    path: APP_BUILD_PATH,
  },
  resolve: {
    modules: [APP_PATH, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      src: APP_PATH,
      content: utils.resolve('src/content'),
      components: utils.resolve('src/components'),
      store: utils.resolve('src/store'),
      'lodash-es': 'lodash',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              context: CONTENT_PATH,
              name: utils.getResourceName(DEV_MODE),
              limit: 1024,
            },
          },
          // {
          //   loader: 'image-webpack-loader',
          //   options: {
          //     bypassOnDebug: DEV_MODE,
          //   },
          // },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
        options: {
          context: CONTENT_PATH,
          name: utils.getResourceName(DEV_MODE),
          limit: 5000,
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['./build/app'], { root: process.cwd() }),
    new webpack.DefinePlugin({
      'process.env.DEV_MODE': DEV_MODE,
      'process.env.prefix': JSON.stringify(prefix),
      'process.env.appPrefix': JSON.stringify(appPrefix),
      'process.env.NODE_ENV': JSON.stringify(config.getNodeEnv()),
      'process.env.apiPrefix': JSON.stringify(
        config.isCustomAPIPrefix() ? defaultPrefix : ''
      ),
    }),
    new webpack.LoaderOptionsPlugin({
      debug: DEV_MODE,
      minimize: !DEV_MODE,
      options: {
        context: CONTENT_PATH,
      },
    }),
    new webpack.HashedModuleIdsPlugin(),
    ...getCommonsChunkPlugins(),
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn'],
    }),
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: 'index.html',
      inject: 'body',
      chunksSortMode: 'dependency',
    }),
    new CopyWebpackPlugin([
      {
        from: utils.resolve('src/assets/static'),
        to: utils.resolve('build/app/assets/static'),
      },
    ]),
    new ManifestPlugin(),
  ],
};

if (isHMREnabled) {
  webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
}

function getCommonsChunkPlugins() {
  const plugins = [];
  if (isHMREnabled) {
    plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        names: [],
        minChunks: Infinity,
      })
    );
    return plugins;
  }
  plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      minChunks: module => {
        return (
          module.context &&
          module.context.includes('node_modules') &&
          !String(module.resource).endsWith('.css') &&
          !String(module.resource).endsWith('.scss')
        );
      },
    })
  );
  plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
      minChunks: Infinity,
    })
  );
  plugins.push(
    new InlineChunkWebpackPlugin({
      inlineChunks: ['runtime'],
    })
  );

  return plugins;
}

module.exports = webpackConfig;
