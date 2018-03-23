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

  let {sources, destination, cwd, watch} = options;

  cwd = path.resolve(cwd);

  const entries = {};

  sources.forEach((source) => {

    // TODO remove the sync
    source = path.resolve(cwd, source);

    const files = glob.hasMagic(source) ? glob.sync(source): [source];

    files.forEach((file)=> {

      const {dir, name} = path.parse(file);
      const key = path.relative(cwd, dir) + '/' + name;

      entries[key] = file;
    })
  })

  const config = Object.assign({}, webpackConfig, {

    watch,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].js'
    }
  })

  const instance = webpack(config);

  const run = Promise.promisify(instance.run.bind(instance));

  return run()
    .then((stats) => {

      console.log(stats.toString({colors: true}));

      if (stats.hasErrors()) {

        console.error(stats.errors);
      }


      instance.stats = stats;

      return instance;
    })
}