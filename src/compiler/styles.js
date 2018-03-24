const stylus = require('stylus');
const dependencyTree = require('dependency-tree');
const path = require('path');
const glob = require('glob');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = Promise.promisify(require('mkdirp'));

const stylusConfig = {

  'include css': true,
  paths: [
    './node_modules',
  ],
  // import: ['./styles/index.styl'],
  use: [

    function () {

      return (style) => {

        const {options} = style;
        const {filename} = options;
        const {dir} = path.parse(filename);

        const deps = dependencyTree.toList({
          filename: path.resolve(dir, 'index.jsx'),
          directory: './',
          filter: path => path.indexOf('node_modules') === -1
        })

        deps.slice(0, -1)
          .forEach((dep) => {

            const {dir} = path.parse(dep);
            const stylePath = path.resolve(dir, 'styles.styl');

            if (!fs.existsSync(stylePath)) return;

            style.import(stylePath);
          })

        style.define('file-exist', (p) => {

          return fs.existsSync(p.val);
        })
      };
    }
  ]
}

module.exports = function compileStyles(options) {

  let {sources, destination, cwd, watch} = options;

  return Promise.map(sources, (source) => {

    source = path.resolve(cwd, source);

    const files = glob.hasMagic(source) ? glob.sync(source): [source];

    return Promise.map(files, (file)=> {

      const {dir, name} = path.parse(file);
      const relative = path.relative(cwd, dir);
      const key = (relative ? './' + relative : '.') + '/' + name + '.css';
      const dest = path.resolve(destination, key);

      console.log(file, key, dest);

      return compile(file, dest);
    })
  })
}

function compile(source, dest, options) {

  options = Object.assign({}, stylusConfig, {filename: source});

  return fs.readFileAsync(source, 'utf8')
    .then((content) => {

      const s = stylus(content);

      Object.keys(options)
        .forEach((key) => {

          const value = options[key];

          if(key === 'use' || key === 'import') {

            value.forEach((v) => s[key](v));
            return;
          }

          s.set(key, value);
        })

      return new Promise((resolve, reject) => {
        s.render((err, content) => {

          if(err) return reject(err);

          const {dir} = path.parse(dest);

          return mkdirp(dir)
            .then(() => fs.writeFileAsync(dest, content))
            .then(resolve)
            .catch(reject)
        })
      })
    })


}