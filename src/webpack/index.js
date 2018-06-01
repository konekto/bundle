const Promise = require('bluebird');
const webpack = require('webpack');
const browserSync = require('../sync');
const WriteFilePlugin = require('write-file-webpack-plugin');


// export
module.exports = _webpack;

function _webpack(config, options) {

  const {log, watch, mode, sync, destination} = options;

  let watching;
  let taskFn;

  const hotPlugins = sync ? [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new WriteFilePlugin({
      test: /^(?!.*(hot)).*/
    })
  ] : [];

  const output = sync ? {
    ...config.output
  } : config.output

  config = {
    ...config,
    watch,
    output,
    plugins: [
      ...config.plugins,
      new webpack.DefinePlugin({NODE_ENV: JSON.stringify(mode)}),
      ...hotPlugins
    ]
  }

  console.log('entry', config.entry);
  console.log('output', config.output);

  if(sync) {

    return browserSync(config, options);
  }

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

      instance._options = options;
      instance.stats = stats;

      // add watching methods
      if (watching) {

        instance.watching = watching;

        instance.close = () => new Promise((resolve) => watching.close(resolve));
        instance.onChange = createOnChangeListener(instance);
        instance.removeChangeListener = createRemoveChangeListener(instance);
        createFilesHasChangedPromise(instance);
      }

      return instance;
    })
}


function createFilesHasChangedPromise(instance) {

  instance.onChange(()=> {

    console.log('change detected')

    instance._resolve();
    instance.filesHasChanged = new Promise((resolve) => {

      instance._resolve = resolve;
    })
  });

  instance.filesHasChanged = new Promise((resolve) => {

    instance._resolve = resolve;
  });
}

function createOnChangeListener(instance) {

    const {watching, _options} = instance;

    instance._changeCallbacks = [];
    watching.compiler.hooks.done.tap('done', (stats)=> {

      instance.stats = stats;
      _options.log && console.log(stats.toString({colors: true}));

      instance._changeCallbacks.forEach(cb => cb(stats))
    })

    return function addChangeCallback(cb) {

      instance._changeCallbacks.push(cb);
    }
}

function createRemoveChangeListener(instance) {

  return function removeChangeListener(cb) {

    instance._changeCallbacks.filter((_cb) => cb !== _cb);
  }
}
