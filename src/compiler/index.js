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
  if(scriptsConfig) {
    configs.push(scriptsConfig);
    console.log('Adding scripts config: ', scriptsConfig);
  }
  if(stylesConfig) {
    configs.push(stylesConfig);
    console.log('Adding style config: ', stylesConfig);
  }
  if(!stylesConfig && !scriptsConfig) console.log('No config loaded');

  return webpack(configs, options);
}

