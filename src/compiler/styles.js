const path = require('path');
const webpack = require('../webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {getWebpackEntries, getIncludeFiles, normalizeOptions} = require('../utils');
const {resolve} = require;


const styleLoader = {
  loader: path.resolve(__dirname, './loaders/style.js')
}

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


  const plugins = [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]

  const styleLoaders = loader ? [styleLoader] : [];

  const uses = [MiniCssExtractPlugin.loader]

  return {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].tmp',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.styl$/,
          exclude: /node_modules/,
          use: [
            ...uses,
            resolve('css-loader'),
            {
              loader: resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('autoprefixer')()
                ]
              }
            },
            {
              loader: resolve('stylus-loader'),
              options: {
                'include css': true,
                paths: [cwd],
                import: getIncludeFiles(options),
              },
            },
            ...styleLoaders
          ],
        }
      ]
    },
    plugins
  }
}
