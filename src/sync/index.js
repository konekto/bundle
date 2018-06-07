const browserSync = require('browser-sync');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const isNotHot = /^(?!.*(hot)).*/;

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


module.exports = function sync(instance, config, options) {

  const bs = browserSync({

    ...defaultOptions,
    proxy: {
      target: options.sync,
    },
    middleware: [
      webpackDevMiddleware(instance, {
        publicPath: config.output.publicPath,
        writeToDisk: (f) => isNotHot.test(f),
        stats: { colors: true }
      }),
      webpackHotMiddleware(instance)
    ]
  });

  // reload styles
  instance.hooks.done.tap('BrowserSync', ()=> bs.reload('*.css'))

  return Promise.resolve(bs);
}
