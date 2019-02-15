'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
const isHMREnabled = config.isHMREnabled();
const isSSREnabled = config.isSSREnabled();
const APP_PATH = utils.APP_PATH;
const CONTENT_PATH = APP_PATH;
const APP_BUILD_PATH = utils.APP_BUILD_PATH;
const ENTRY_NAME = utils.ENTRY_NAME;

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
    [ENTRY_NAME.APP]: [appIndex],
  };
}

const webpackConfig = {
  entry,
  output: {
    path: APP_BUILD_PATH,
  },
  resolve: {
    ...utils.getWebpackResolveConfig(),
  },
  module: {
    rules: [
      utils.getBabelLoader(DEV_MODE),
      utils.getImageLoader(DEV_MODE, CONTENT_PATH),
      utils.getMediaLoader(DEV_MODE, CONTENT_PATH),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['../build/app'], { verbose: false }),
    new webpack.DefinePlugin({
      __isBrowser__: true,
      __HMR__: isHMREnabled,
      __SSR__: isSSREnabled,
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
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: isSSREnabled ? 'index-backup.html' : 'index.html',
      inject: 'body',
      chunksSortMode: 'dependency',
      favicon: path.join(__dirname, '../src/assets/static/favicon.ico'),
    }),
    new CopyWebpackPlugin([
      {
        from: utils.resolve('src/assets/static'),
        to: utils.resolve('build/app/assets/static'),
      },
    ]),
    new LoadablePlugin({
      filename: 'loadable-stats.json',
      writeToDisk: {
        filename: utils.resolve('build/'),
      },
    }),
    new ManifestPlugin({
      publicPath: '',
    }),
    // new HtmlWebpackCustomPlugin(),
  ],
};

function HtmlWebpackCustomPlugin(options) {
  // Configure your plugin with options...
}

HtmlWebpackCustomPlugin.prototype.apply = function(compiler) {
  compiler.hooks.compilation.tap(
    'InsertSSRBundleScriptsPlugin',
    compilation => {
      console.log('The compiler is starting a new compilation...');

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
        'InsertSSRBundleScriptsPlugin',
        (data, cb) => {
          console.log('data: ', data.assets);
          // console.log('chunks: ', data.assets.chunks);
          // console.log('compilation.assets.app: ', Object.getOwnPropertyNames(compilation));
          console.log('compilation.entries: ', compilation.entries.length);
          // console.log('compilation.entries: ', compilation.entries[0].NormalModule.dependencies);
          console.log(
            'compilation.chunks: ',
            compilation.chunks.length,
            compilation.chunks
          );
          // console.log('compilation.assets: ', compilation.assets);
          cb(null, data);
        }
      );
    }
  );
};

module.exports = webpackConfig;
