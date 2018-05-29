const path = require('path');
const compileScripts = require('./scripts');
const compileStyles = require('./styles');
const webpack = require('../webpack');

const clientLoader = {
  test: /index\.jsx$/,
  exclude: /node_modules/,
  loader: path.resolve(__dirname, './loaders/client.js')
};

const styleLoader = {
  test: /index\.jsx$/,
  exclude: /node_modules/,
  loader: path.resolve(__dirname, './loaders/style.js')
};

// export
module.exports = {compile, compileStyles, compileScripts};

/**
 * Compile anything
 * @param options
 */
function compile(options) {

  const {destination, loader} = options;
  const scriptsConfig = compileScripts.getWebpackConfig(options);
  const stylesConfig = compileStyles.getWebpackConfig(options);

  const loaderRules = options.loader? [clientLoader, styleLoader] : [];

  const config = {

    ...scriptsConfig,
    ...stylesConfig,
    output: {
      path: path.resolve(destination),
      filename: loader ? '[name]/client.js' : '[name]'
    },
    entry: {
      ...scriptsConfig.entry,
      ...stylesConfig.entry,
    },
    module: {
      rules: [
        ...loaderRules,
        ...stylesConfig.module.rules,
        ...scriptsConfig.module.rules,
      ]
    },
    plugins: [
      ...stylesConfig.plugins,
      ...stylesConfig.plugins,
    ]
  }

  return webpack(config, options);
}

