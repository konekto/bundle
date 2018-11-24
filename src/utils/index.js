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
  return getFiles(sources, cwd);
}

/**
 * Get file paths from includes
 * @param options
 * @param ext
 * @returns {*}
 */
function getIncludeFiles(options, ext) {

  const {includes, cwd} = options;
  const files = getFiles(includes, cwd);

  return files.filter((f)=> getExtension(f) === ext);
}

/**
 *  get functional webpack entries from sources
 * @param options
 * @param extension
 */
function getWebpackEntries(options, extension) {

  const {cwd, sync} = options;
  const sourcefiles = getSourceFiles(options);
  const includeFiles = getIncludeFiles(options, extension);
  const entries = {};

  console.log('  Generating Webpack entries from sourcefiles: ', sourcefiles);

  sourcefiles.forEach((file)=> {

    const {dir, name, ext} = path.parse(file);
    console.log(   'file: ', file);
    if(!checkExtension(ext, extension)) {
      console.log('   extension not permitted: ', ext);
      return
    }

    const key = path.relative(cwd, dir) + '/' + name;
    const files = includeFiles.length ? [...includeFiles, file] : [file];

    if(extension === 'js') {

      files.unshift(resolve('babel-polyfill'));

      if(sync) {

        files.unshift(resolve('webpack-hot-middleware/client'));
      }
    }

    entries[key] = files;
  })
  console.log('  Generated entries: ', entries);
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

function getExtension(file) {

  const {ext} = path.parse(file);
  return extensionMap[ext];
}
