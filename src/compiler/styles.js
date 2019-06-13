const path = require('path');
const webpack = require('../webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { getWebpackEntries, getIncludeFiles, normalizeOptions } = require('../utils');
const { resolve } = require;


const styleLoader = {
  loader: path.resolve(__dirname, './loaders/style.js')
}

// exports
module.exports = compileStyles;
module.exports.getWebpackConfig = getWebpackConfig;

function compileStyles(options) {

  return webpack(getWebpackConfig(options), options);
}

function getWebpackConfig(options) {

  const { destination, mode, loader, cwd, sync } = normalizeOptions(options);
  const entries = getWebpackEntries(options, 'css');

  const plugins = [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]

  const styleLoaders = loader ? [styleLoader] : [];

  const uses = [{
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: mode === 'development',
      reloadAll: true,
    }
  },];

  console.log("");
  console.log('Generating styles webpack config...');
  console.log('  mode: ', mode);
  console.log('  destination: ', destination);
  console.log('  entry: ', entries);
  console.log("");

  return {
    mode,
    cache: true,
    entry: entries,
    devtool: mode === 'development' ? 'eval' : 'nosources-source-map',
    output: {
      path: path.resolve(destination),
      filename: '[name].tmp',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.jsx', '.styl']
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
                preferPathResolver: 'webpack',
                import: getIncludeFiles(options, 'css'),
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
