const path = require('path');
const compileScripts = require('./scripts');
const compileStyles = require('./styles');
const webpack = require('../webpack');

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

  const config = {

    ...scriptsConfig,
    ...stylesConfig,
    output: {
      path: path.resolve(destination),
      filename: '[name].js',
      publicPath: '/'
    },
    entry: {
      ...scriptsConfig.entry,
      ...stylesConfig.entry,
    },
    module: {
      rules: [
        ...stylesConfig.module.rules,
        ...scriptsConfig.module.rules,
      ]
    },
    plugins: [
      ...scriptsConfig.plugins,
      ...stylesConfig.plugins,
    ]
  }

  return webpack(config, options);
}

