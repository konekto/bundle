const fs = require('fs');
const path = require('path');
const dependencyTree = require('dependency-tree')
const Promise = require('bluebird');

module.exports = function styleLoader(content) {

  this.cacheable();
  const callback = this.async();

  const {resourcePath} = this;
  const {dir} = path.parse(resourcePath);
  const jsxFile = path.resolve(dir, 'index.jsx');

  const deps = dependencyTree.toList({
    filename: jsxFile,
    directory: './',
    filter: path => path.indexOf('node_modules') === -1
  })
    .slice(0, -1)
    .map((dep) => {

      const {dir: depDir} = path.parse(dep);
      return  path.resolve(depDir, 'styles.styl');
    })

  return Promise
    .filter(deps, exists)
    .then((existingDeps)=> {

      const imports = existingDeps.map((d)=> `@import "${d}";`).join('\n');

      callback(null, `${imports}\n${content}`);

      return null;
    })
};

function exists(file) {

  return new Promise((resolve) => {

    fs.access(file, fs.constants.F_OK, (err)=> {

      return resolve(!err)
    })
  })
}
