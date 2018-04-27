'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const InlineChunkWebpackPlugin = require('html-webpack-inline-chunk-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ReactLoadablePlugin = require('react-loadable/webpack')
  .ReactLoadablePlugin;
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
// const HtmlWebpackInlineStylePlugin = require('html-webpack-inline-style-plugin');

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
const isHMREnabled = config.isHMREnabled();
const isSSREnabled = config.isSSREnabled();
const APP_PATH = utils.APP_PATH;
const CONTENT_PATH = APP_PATH;
const APP_BUILD_PATH = utils.APP_BUILD_PATH;
const ENTRY_NAME = {
  APP: 'app',
  VENDORS: 'vendors',
  RUNTIME: 'runtime',
};

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
    [ENTRY_NAME.APP]: appIndex,
  };
}

function InsertSSRBundleScriptsPlugin(options) {
  // Configure your plugin with options...
}

InsertSSRBundleScriptsPlugin.prototype.apply = function(compiler) {
  compiler.plugin('compilation', compilation => {
    // console.log('The compiler is starting a new compilation...');

    compilation.plugin(
      'html-webpack-plugin-after-html-processing',
      (data, cb) => {
        let html = data.html;
        // console.log(data.assets);
        const appDiv = '<div id="app"></div>';
        const initDataScript =
          '<script type="text/javascript">window.__INITIAL_DATA__ = {{initialData | safe}}</script>';

        // console.log('appDiv: ', html.indexOf(appDiv));
        data.html = html.replace(
          appDiv,
          `<div id="app">{{SSRHtml | safe}}</div>\n${initDataScript}`
        );

        // console.log(data.html);

        const vendorsAsset = data.assets.js.find(
          asset => String(asset).indexOf(ENTRY_NAME.VENDORS) >= 0
        );

        if (!vendorsAsset) {
          cb(null, data);
          return;
        }
        const vendorsAssetScript = `<script type="text/javascript" src="${vendorsAsset}"></script>`;
        data.html = data.html.replace(
          vendorsAssetScript,
          `\n{{bundleScripts|safe}}\n${vendorsAssetScript}`
        );
        // console.log('html data:');

        cb(null, data);
      }
    );
  });
};

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
    ...getCommonsChunkPlugins(),
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn'],
    }),
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: 'index.html',
      inject: 'body',
      chunksSortMode: 'dependency',
      alwaysWriteToDisk: true,
      inlineSource: '.(css)$',
    }),

    new CopyWebpackPlugin([
      {
        from: utils.resolve('src/assets/static'),
        to: utils.resolve('build/app/assets/static'),
      },
    ]),
    new ReactLoadablePlugin({
      filename: utils.resolve('build/react-loadable.json'),
    }),
    new ManifestPlugin(),
  ],
};

if (isHMREnabled) {
  webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
  // webpackConfig.plugins.push(new HtmlWebpackInlineStylePlugin());
  webpackConfig.plugins.push(new HtmlWebpackHarddiskPlugin());
} else {
  webpackConfig.plugins.push(new InsertSSRBundleScriptsPlugin());
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
      name: ENTRY_NAME.VENDORS,
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
      name: ENTRY_NAME.RUNTIME,
      minChunks: Infinity,
    })
  );
  //only inline runtime when production
  if (!DEV_MODE) {
    plugins.push(
      new InlineChunkWebpackPlugin({
        inlineChunks: [ENTRY_NAME.RUNTIME],
      })
    );
  }

  return plugins;
}

module.exports = webpackConfig;
