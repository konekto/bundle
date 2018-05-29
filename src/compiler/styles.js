const path = require('path');
const webpack = require('../webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {getWebpackEntries, getIncludeFiles, normalizeOptions} = require('../utils');

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
};

// exports
module.exports = compileStyles;
module.exports.getWebpackConfig = getWebpackConfig;

function compileStyles(options) {

  return webpack(getWebpackConfig(options), options);
}

function getWebpackConfig(options) {

  const {destination, mode, loader, cwd, sync} = normalizeOptions(options);

  const entries = getWebpackEntries(options, 'css');

  const useCSSLoader = mode === 'development' && sync;

  const plugins = useCSSLoader ? [] : [
    new MiniCssExtractPlugin({
      filename: loader ? '[name]/styles.css' : '[name]',
      chunkFilename: '[id].css'
    })
  ]

  return {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].tmp'
    },
    module: {
      rules: [
        {
          test: /\.styl$/,
          exclude: /node_modules/,
          use: [
            useCSSLoader? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'stylus-loader',
              options: {
                paths: [cwd],
                import: getIncludeFiles(options)
              },
            },
          ],
        }
      ]
    },
    plugins
  }
}
