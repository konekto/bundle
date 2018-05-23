const path = require('path');
const webpack = require('../webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {getWebpackEntries, getIncludeFiles, normalizeOptions} = require('../utils');

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map'
};

module.exports = function compileStyles(options) {

  const {destination, mode, cwd} = normalizeOptions(options);

  const entries = getWebpackEntries(options);

  const config = {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].css.tmp'
    },
    module: {
      rules: [
        {
          test: /\.styl$/,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            // 'style-loader',
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
    plugins : [
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      })
    ]
  }

  return webpack(config, options);
}
