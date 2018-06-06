const path = require('path');
const glob = require('glob');

const {resolve} = require;

const extensionMap = {
  '.styl': 'css',
  '.jsx': 'js'
};

// export
module.exports = {getSourceFiles, getIncludeFiles, getWebpackEntries, normalizeOptions}

/**
 * normalize options object
 * @param options
 * @returns {*}
 */
function normalizeOptions(options) {

  let {cwd, mode, includes, log, sync, watch} = options;

  options.cwd = path.resolve(cwd);
  options.mode = mode || 'development';
  options.includes = includes || [];
  options.log = log !== undefined ? log : true;
  options.watch = sync ? true : watch;

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
 * @param extension
 */
function getWebpackEntries(options, extension) {

  const {cwd, sync} = options;
  const sourcefiles = getSourceFiles(options);
  const entries = {};

  sourcefiles.forEach((file)=> {

    const {dir, name, ext} = path.parse(file);

    if(!checkExtension(ext, extension)) return;

    const key = path.relative(cwd, dir) + '/' + name;
    const files = [file];

    if(extension === 'js') {

      files.unshift(resolve('babel-polyfill'));
    }

    if(sync) {

      files.unshift(resolve('webpack-hot-middleware/client') + '?reload=true');
    }

    entries[key] = files;
  })

  return entries;
}


function getFiles(sources, cwd) {

  return sources.reduce((prev, source) => {

    const sourcePath = path.resolve(cwd, source);
    const files = glob.hasMagic(sourcePath) ? glob.sync(sourcePath) : [sourcePath];

    return [...prev, ...files];
  }, [])
}

function checkExtension(before, after) {

  return extensionMap[before] === after;
}
