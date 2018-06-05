const browserSync = require('browser-sync');

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


module.exports = function sync(instance, options) {

  options = Object.assign({}, defaultOptions, options, {
    proxy: {
      target: options.sync,
    },
  });

  const bs = browserSync({

    ...defaultOptions,
    ...options,
    proxy: {
      target: options.sync
    }
  });

  instance.onChange(()=> {

    bs.reload();
  })

  return Promise.resolve(bs);
}
