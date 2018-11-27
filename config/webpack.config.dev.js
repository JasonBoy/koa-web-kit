'use strict';

const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const LOADER = utils.LOADER;

const isHMREnabled = config.isHMREnabled();
const isCSSModules = config.isCSSModules();

const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: isHMREnabled ? '/' : utils.getPublicPath(),
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        //just import css, without doing CSS MODULES stuff when it's from 3rd libs
        test: /\.css$/,
        include: /node_modules/,
        use: [
          isHMREnabled ? LOADER.STYLE_LOADER : MiniCssExtractPlugin.loader,
          LOADER.CSS_LOADER,
        ],
      },
      {
        //app css code should check the CSS MODULES config
        test: /\.css$/,
        include: utils.resolve('src'),
        use: [
          isHMREnabled ? LOADER.STYLE_LOADER : MiniCssExtractPlugin.loader,
          utils.getCSSLoader(isCSSModules),
          LOADER.POSTCSS_LOADER,
        ],
      },
      {
        //app scss/sass code should check the CSS MODULES config
        test: /\.(sa|sc)ss$/,
        use: [
          isHMREnabled ? LOADER.STYLE_LOADER : MiniCssExtractPlugin.loader,
          utils.getCSSLoader(isCSSModules, 2),
          LOADER.POSTCSS_LOADER,
          LOADER.SASS_LOADER,
        ],
      },
    ],
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
  stats: { children: false },
  plugins: [],
});

// optimization new in webpack4
if (!isHMREnabled) {
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  );
  webpackConfig.optimization = {
    namedModules: true,
    runtimeChunk: 'single',
  };
}

console.log(
  'webpackConfig.output.publicPath: ',
  webpackConfig.output.publicPath
);
// console.log(webpackConfig);
// console.log(webpackConfig.plugins);
module.exports = webpackConfig;
