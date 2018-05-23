const path = require('path');
const glob = require('glob');

// export
module.exports = {getSourceFiles, getIncludeFiles, getWebpackEntries, normalizeOptions}

/**
 * normalize options object
 * @param options
 * @returns {*}
 */
function normalizeOptions(options) {

  let {cwd, mode, includes, log} = options;

  options.cwd = path.resolve(cwd);
  options.mode = mode || 'development';
  options.includes = includes || [];
  options.log = log !== undefined ? log : true;

  return options;
}

/**
 * Get file paths from sources
 * @param options
 * @returns {*}
 */
function getSourceFiles(options) {

  const {sources, cwd} = options;

  return getFiles(sources, cwd);
}

/**
 * Get file paths from includes
 * @param options
 * @returns {*}
 */
function getIncludeFiles(options) {

  const {includes, cwd} = options;

  return getFiles(includes, cwd);
}

/**
 *  get functional webpack entries from sources
 * @param options
 */
function getWebpackEntries(options) {

  const {cwd} = options;
  const sourcefiles = getSourceFiles(options);
  const entries = {};

  sourcefiles.forEach((file)=> {

    const {dir, name} = path.parse(file);
    const key = path.relative(cwd, dir) + '/' + name;

    entries[key] = file;
  })

  return entries;
}



function getFiles(sources, cwd) {

  return sources.reduce((prev, source) => {

    const sourcePath = path.resolve(cwd, source);
    const files = glob.hasMagic(sourcePath) ? glob.sync(sourcePath) : [sourcePath];

    return prev.concat(files);
  }, [])
}
