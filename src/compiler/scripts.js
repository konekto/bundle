const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const Promise = require('bluebird');


const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /index\.jsx$/,
        exclude: /node_modules/,
        loader: path.resolve(__dirname, './loaders/client.js')
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      }
    ]
  },
};

module.exports = function compileScripts(options) {

  let {sources, destination, cwd, watch, log} = options;

  cwd = path.resolve(cwd);

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

  const config = Object.assign({}, webpackConfig, {

    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].js'
    }
  })

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

      if(watching) {

        instance.close = Promise.promisify((cb)=> watching.close(cb));
      }

      return instance;
    })
}