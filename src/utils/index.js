const path = require('path');
const glob = require('glob');

const {resolve} = require;

const extensionMap = {
  '.styl': 'css',
  '.jsx': 'js',
  '.js': 'js'
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
  options.watch = sync ? false : watch;

  return options;
}

/**
 * Get file paths from sources
 * @param options
 * @returns {*}
 */
function getSourceFiles(options) {

  const {sources, cwd} = options;
  console.log('  Generating source files from sources: ', sources, ' in dir ', cwd);
  const files = getFiles(sources, cwd);
  if (!files.length) throw new Error('Your sources definition, ['+sources+'] did not match any files in, '+cwd);
  return files
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
  console.log('  Generating Webpack entries from sourcefiles: ', sourcefiles);
  sourcefiles.forEach((file)=> {
      
    const {dir, name, ext} = path.parse(file);
    console.log(   'file: ', file);
    if(!checkExtension(ext, extension)) {
      ('  extension not permitted: ', ext);
      return
    }

    const key = path.relative(cwd, dir) + '/' + name;
    const files = [file];

    if(extension === 'js') {

      files.unshift(resolve('babel-polyfill'));

      if(sync) {

        files.unshift(resolve('webpack-hot-middleware/client'));
      }
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
