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

  if(Object.keys(scriptsConfig.entry).length) {

    configs.push(scriptsConfig);
    console.log('Adding scripts config: ', scriptsConfig);

  } else {

    console.log('No entries for scripts');
  }

  if(Object.keys(stylesConfig.entry).length) {

    configs.push(stylesConfig);
    console.log('Adding style config: ', stylesConfig);

  } else {

    console.log('No entries for styles');
  }

  return webpack(configs, options);
}

