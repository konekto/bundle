const browserSync = require('browser-sync');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');

const defaultOptions = {
  port: 3010,
  notify: false,
  ghostMode: false,
  logLevel: 'debug',
  open: false,
  stream: true,
  watchOptions: {
    ignoreInitial: true
  },
};


module.exports = function sync(config, options) {

  const compiler = webpack(config);

  options = Object.assign({}, defaultOptions, options, {
    proxy: {
      target: options.sync,
      ws: true,
    },
    middleware: [
      webpackDevMiddleware(compiler, {
        quiet: true,
        path: config.output.path,
        contentBase: config.output.path,
        publicPath: config.output.publicPath,
        stats: {
          colors: true,
        },
      }),
      webpackHotMiddleware(compiler, {
        log: () => {},
      }),
    ],
  });

  const bs = browserSync(options);

  return Promise.resolve(bs);
}
