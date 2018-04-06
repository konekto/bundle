const stylus = require('stylus');
const dependencyTree = require('dependency-tree');
const path = require('path');
const glob = require('glob');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = Promise.promisify(require('mkdirp'));
const watcher = require('../watcher');

const stylusConfig = {

  'include css': true,
  paths: [
    './node_modules',
  ],
  use: [
    fileExist
  ]
}

module.exports = function compileStyles(options) {

  let {sources, cwd, includes, watch, log} = options;

  includes = includes || [];

  return compileSources(options)
    .then(()=> {

      if(!watch) return;

      const sourcesToWatch = sources.concat(includes);
      const mappedSources = sourcesToWatch.map((s)=> path.resolve(cwd, s));

      let instance;

      return watcher(mappedSources, (file) => {

        if (log) {

          console.log('change detected', file);
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
    })
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

  // add loader
  if (options.loader) {

    stylusOptions.use.unshift(loader);
  }

  return fs.readFileAsync(source, 'utf8')
    .then((content) => {

      const s = stylus(content);

      // set the filename first
      s.set('filename', source);

      Object.keys(stylusOptions)
        .forEach((key) => {

          const value = stylusOptions[key];

          if(!value) return;

          if (key === 'use' || key === 'import') {

            value.forEach((v) => s[key](v));
            return;
          }

          s.set(key, value);
        })

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
}


function loader (style) {

  const {options} = style;
  const {filename} = options;
  const {dir: fileDir} = path.parse(filename);

  const deps = dependencyTree.toList({
    filename: path.resolve(fileDir, 'index.jsx'),
    directory: './',
    filter: path => path.indexOf('node_modules') === -1
  })

  deps.slice(0, -1)
    .forEach((dep) => {

      const {dir: depDir} = path.parse(dep);
      const stylePath = path.resolve(depDir, 'styles.styl');

      if (!fs.existsSync(stylePath)) return;

      style.import(path.relative(fileDir, stylePath));
    })
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
