'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const config = require('./env');
const utils = require('./utils');
const nodeExternals = require('webpack-node-externals');

const LOADER = utils.LOADER;

const DEV_MODE = config.isDevMode();
const APP_PATH = utils.APP_PATH;

const prefix = utils.normalizeTailSlash(
  utils.normalizePublicPath(
    path.join(config.getAppPrefix(), config.getStaticPrefix())
  ),
  config.isPrefixTailSlashEnabled()
);

const webpackConfig = webpackMerge(
  {},
  {
    entry: {
      ssr: utils.resolve('src/ssr/index.js'),
    },
    target: 'node',
    mode: DEV_MODE ? 'development' : 'production',
    output: {
      path: utils.resolve('build/node'),
      filename: '[name].js',
      libraryExport: 'default',
      libraryTarget: 'commonjs2',
    },
    externals: [nodeExternals()],
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
              cacheDirectory: DEV_MODE,
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            // MiniCssExtractPlugin.loader,
            LOADER.CSS_LOADER,
            LOADER.POSTCSS_LOADER,
            LOADER.SASS_LOADER,
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                context: APP_PATH,
                name: utils.getResourceName(DEV_MODE),
                limit: 1024,
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
          loader: 'file-loader',
          options: {
            context: APP_PATH,
            name: utils.getResourceName(DEV_MODE),
            limit: 5000,
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __isBrowser__: false,
        __pathPrefix__: JSON.stringify(prefix),
      }),
      new webpack.LoaderOptionsPlugin({
        debug: DEV_MODE,
        minimize: !DEV_MODE,
        options: {
          context: APP_PATH,
        },
      }),
      // new MiniCssExtractPlugin({
      //   filename: "[name].css",
      //   chunkFilename: "[id].css"
      // }),
    ],
  }
);

module.exports = webpackConfig;
