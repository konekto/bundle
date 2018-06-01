const path = require('path');
const webpack = require('../webpack');
const {getWebpackEntries, normalizeOptions} = require('../utils')
const Promise = require('bluebird');
const {resolve} = require;

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: resolve('babel-loader'),
        options: {
          // cacheDirectory: true
        }
      }
    ]
  },
  plugins: [

  ]
};

// exports
module.exports = compileScripts;
module.exports.getWebpackConfig = getWebpackConfig;

/**
 * compile scripts given the options
 * @param options
 * @returns {PromiseLike<T> | Promise<T>}
 */
function compileScripts(options) {

  return webpack(getWebpackConfig(options), options);
}


function getWebpackConfig(options) {

  const {destination, mode, loader} = normalizeOptions(options);

  const entries = getWebpackEntries(options, 'js');

  return {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: loader ? '[name]/client.js' : '[name]'
    },
    plugins : []
  }
}
