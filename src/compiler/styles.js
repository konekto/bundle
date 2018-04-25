const stylus = require('stylus');
const dependencyTree = require('dependency-tree');
const path = require('path');
const glob = require('glob');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = Promise.promisify(require('mkdirp'));
const watcher = require('../watcher');
const _ = require('lodash');

const stylusConfig = {

  'include css': true,
  paths: [
    './node_modules',
  ],
  use: [
    fileExist
  ]
}

/**
 * Compile with options
 * @param options
 */
module.exports = function compileStyles(options) {

  let {watch} = options;

  // TODO check paths

  return compileSources(options)
    .then(()=> {

      if(!watch) return;

      return watchSources(options);
    })
}

/**
 * watch sources for changes
 */
function watchSources(options) {

  let {log} = options;

  const deps = getWatchSources(options);

  let instance;

  return watcher(deps, (file) => {

    log && console.log('change detected', file);

    const newDeps = getWatchSources(options);

    // we got some new files
    if(newDeps.length !== deps.length) {

      log && console.log('dependencies difference', _.xor(deps, newDeps));

      instance.close();

      watchSources(options)
        .then((newInstance) => {

          instance.callbacks = newInstance.callbacks;
        })
    }

    return compileSources(options)
      .then(()=> {

        instance.callbacks.forEach(cb => cb());
      });
  })
    .then((watcher) => {

      instance = watcher;
      instance.callbacks = [];
      instance.onChange = (cb)=> instance.callbacks.push(cb);
      instance.removeChangeListener = (cb)=> instance.callbacks = instance.callbacks.filter((fn) => fn !== cb)
      createFilesHasChangedPromise(instance);

      return instance;
    })
}

function getWatchSources(options) {

  let {sources, cwd, includes, loader} = options;

  includes = includes || [];

  const sourcesToWatch = sources.concat(includes);
  const mappedSources = sourcesToWatch.map((s)=> path.resolve(cwd, s));
  let deps = getDependencies(mappedSources);

  if(loader) {

    const loaderDeps = deps.reduce((prev, current)=> {

      return prev.concat(getLoaderDependencies(current));
    }, []);

    deps = deps.concat(loaderDeps);
    deps = _.uniq(deps);
  }

  return deps;
}

function compileSources(options) {

  const {sources, cwd} = options;

  return Promise.map(sources, (source) => {

    source = path.resolve(cwd, source);

    const files = glob.hasMagic(source) ? glob.sync(source) : [source];

    return Promise.map(files, (file) => compile(file, options))
  })
}

function getDestination(file, options) {

  let {destination, cwd} = options;

  const {dir, name} = path.parse(file);
  const relative = path.relative(cwd, dir);
  const key = (relative ? './' + relative : '.') + '/' + name + '.css';
  return path.resolve(destination, key);
}

function compile(source, options) {

  const dest = getDestination(source, options);
  const stylusOptions = Object.assign({}, stylusConfig, {import: options.includes});

  // add cwd to paths
  if(stylusOptions.paths) {

    stylusOptions.paths = [...stylusOptions.paths, options.cwd];
  }

  if(options.log) {

    console.log('compiling', source);
  }

  return fs.readFileAsync(source, 'utf8')
    .then((content) => {

      const s = stylus(content);

      // set the filename first
      s.set('filename', source);

      Object.keys(stylusOptions)
        .forEach((key) => {

          let value = stylusOptions[key];

          if(!value) return;

          if (key === 'use') {

            if(!Array.isArray(value)) {

              value = [value];
            }

            value.forEach((v) => s.use(v));
            return;
          }

          if (key === 'use' || key === 'import') {

            if(!Array.isArray(value)) {

              value = [value];
            }

            value.forEach((v) => {

              const resolvedPath = path.resolve(options.cwd, v);

              s.import(v)
            });
            return;
          }

          s.set(key, value);
        })

        if (options.loader) {

          const deps = getLoaderDependencies(source);

          deps.forEach((dep) => s.import(dep));
        }

      return new Promise((resolve, reject) => {
        s.render((err, content) => {

          if (err) return reject(err);

          const {dir} = path.parse(dest);

          return mkdirp(dir)
            .then(() => fs.writeFileAsync(dest, content))
            .then(()=> {

              if (options.log) {

                console.log(`${dest} created!`)
              }
            })
            .then(resolve)
            .catch(reject)
        })
      })
    })
    .catch((err) => {

      console.error(err);
    })
}


function loader (style) {

  const {options} = style;
  const {filename} = options;

  const deps = getLoaderDependencies(filename);

  deps.forEach((dep) => style.import(dep));
}

function fileExist(style) {

  const {options} = style;
  const {filename} = options;
  const {dir} = path.parse(filename);

  style.define('file-exist', (p) => {

    return fs.existsSync(path.relative(dir, p.val));
  })
}


function createFilesHasChangedPromise(instance) {

  instance.filesHasChanged = new Promise((resolve) => {

    instance.callbacks.push(listener);

    function listener() {

      instance.removeChangeListener(listener);

      process.nextTick(()=> createFilesHasChangedPromise(instance));
      resolve();
    }
  })
}

function getLoaderDependencies(file) {

  const {dir: fileDir} = path.parse(file);
  const deps = getDependencies(path.resolve(fileDir, 'index.jsx'));

  return deps.slice(0, -1)
    .map((dep) => {

      const {dir: depDir} = path.parse(dep);
      return  path.resolve(depDir, 'styles.styl');
    })
    .filter((path)=> fs.existsSync(path))
}

function getDependencies(files) {

  if(!Array.isArray(files)) {

    files = [files];
  }

  const deps = files.reduce((prev, current)=> {

    return prev.concat(_getDependencies(current));
  }, []);

  return _.uniq(deps);
}

function _getDependencies(file) {


  return dependencyTree.toList({
    filename: file,
    directory: './',
    filter: path => path.indexOf('node_modules') === -1
  })
}
