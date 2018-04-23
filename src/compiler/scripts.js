const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const Promise = require('bluebird');

const loaderRule = {
  test: /index\.jsx$/,
  exclude: /node_modules/,
  loader: path.resolve(__dirname, './loaders/client.js')
};

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [

  ]
};

/**
 * compile scripts given the options
 * @param options
 * @returns {PromiseLike<T> | Promise<T>}
 */
module.exports = function compileScripts(options) {

  let {sources, destination, cwd, watch, mode, log, loader} = options;

  cwd = path.resolve(cwd);
  mode = mode || 'development';

  const entries = {};

  sources.forEach((source) => {

    source = path.resolve(cwd, source);

    const files = glob.hasMagic(source) ? glob.sync(source): [source];

    files.forEach((file)=> {

      const {dir, name} = path.parse(file);
      const key = path.relative(cwd, dir) + '/' + name;

      entries[key] = file;
    })
  })


  const config = {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].js'
    },
    plugins : [
      new webpack.DefinePlugin({NODE_ENV: JSON.stringify(mode)}),
    ]
  }

  // add loader rule
  if(loader) {

    config.module.rules = [loaderRule, ...config.module.rules];
  }

  let watching;
  let taskFn;

  const instance = webpack(config);

  if (watch) {

    taskFn = (cb)=> {

      watching = instance.watch({}, cb);
    };

  } else {

    taskFn = instance.run.bind(instance);
  }

  const fnPromise = Promise.promisify(taskFn);

  return fnPromise()
    .then((stats) => {

      if(log) {

        console.log(stats.toString({colors: true}));

        if (stats.hasErrors()) {

          console.error(stats.errors);
        }
      }

      instance.stats = stats;

      // add watching methods
      if (watching) {

        instance.close = () => new Promise((resolve) => watching.close(resolve));
        instance.onChange = createOnChangeListener(watching, options);
        instance.removeChangeListener = createRemoveChangeListener(watching);
        createFilesHasChangedPromise(instance, watching);

        // add logger

        instance.onChange(()=> log && console.log('scripts change detected!'))
      }

      return instance;
    })
}

function createFilesHasChangedPromise(instance, watching) {


  instance.filesHasChanged = new Promise((resolve) => {

    watching.callbacks.push(()=> {

      process.nextTick(()=> createFilesHasChangedPromise(instance, watching));
      resolve();
    })
  })
}

function createOnChangeListener(watching, options) {

  watching.removeCallbacks = [];

  return function addChangeCallback(cb) {

    const index = watching.removeCallbacks.indexOf(cb);

    if(index !== -1) {

      return watching.removeCallbacks.splice(index, 1);
    }

    const listener = ()=> {

      process.nextTick(()=> addChangeCallback(cb));
      cb();
    };

    watching.callbacks.push(listener);
  }
}

function createRemoveChangeListener(watching) {


  return function removeChangeListener(cb) {

    watching.removeCallbacks.push(cb);
  }
}
