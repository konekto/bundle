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
  const configs = [];
  if(scriptsConfig) configs.push(scriptsConfig);
  if(stylesConfig) configs.push(stylesConfig);

  return webpack(configs, options);
}

