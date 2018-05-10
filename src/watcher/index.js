const chokidar = require('chokidar');
const Promise = require('bluebird');

module.exports = function watchSources(sources, fn) {

  const watcher = chokidar.watch(sources, {});

  const oldClose = watcher.close.bind(watcher);

  // patch close
  watcher.close = function() {oldClose()}

  watcher.on('change', fn);
  watcher.on('add', fn);
  watcher.on('unlink', fn);

  return new Promise((resolve, reject) => {

    watcher.on('ready', ()=> resolve(watcher));
    watcher.on('error', reject);
  })
}
