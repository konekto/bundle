const compiler = require('./src/compiler');
const webpack = require('./src/webpack');
const watcher = require('./src/watcher');
const sync = require('./src/sync');


module.exports = { ...compiler, webpack, watcher, sync };
