const browserSync = require("browser-sync");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");

const defaultOptions = {
  port: 3010,
  notify: false,
  ghostMode: false
};


module.exports = function sync(options) {

  const {bundler, destination, ...rest} = {...defaultOptions, ...options};

  let browserSyncOptions = rest;

  if(options.bundler) {

    browserSyncOptions = {
      ...rest,
      middleware: [
        webpackDevMiddleware(bundler, {
          publicPath: '/',
          stats: { colors: true }
        }),
        webpackHotMiddleware(bundler)
      ]
    }
  }

  return browserSync(browserSyncOptions);
}
