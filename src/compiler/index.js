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

  const scriptsConfig = compileScripts.getWebpackConfig(options);
  const stylesConfig = compileStyles.getWebpackConfig(options);

  return webpack([scriptsConfig, stylesConfig], options);
}

