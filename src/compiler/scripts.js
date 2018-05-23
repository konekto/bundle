const path = require('path');
const webpack = require('../webpack');
const {getWebpackEntries, normalizeOptions} = require('../utils')
const Promise = require('bluebird');

const loaderRule = {
  test: /index\.jsx$/,
  exclude: /node_modules/,
  loader: path.resolve(__dirname, './loaders/client.js')
};

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [

  ]
};

/**
 * compile scripts given the options
 * @param options
 * @returns {PromiseLike<T> | Promise<T>}
 */
module.exports = function compileScripts(options) {

  const {destination, mode, loader} = normalizeOptions(options);

  const entries = getWebpackEntries(options);


  const config = {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].js'
    },
    plugins : []
  }

  // add loader rule
  if(loader) {

    config.module.rules = [loaderRule, ...config.module.rules];
  }

  return webpack(config, options);
}
