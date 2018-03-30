const chokidar = require('chokidar');
const Promise = require('bluebird');

module.exports = function watchSources(sources, fn) {

  const watcher = chokidar.watch(sources, {});

  watcher
    // .on('add', fn)
    .on('change', fn)
    .on('unlink', fn);

  return new Promise((resolve, reject) => {

    watcher.on('ready', ()=> resolve(watcher));
    watcher.on('error', reject);
  })
}