const path = require('path');
const glob = require('glob');
const compileScripts = require('./scripts');
const compileStyles = require('./styles');
const createSync = require('../sync');
const _ = require('lodash');

/**
 * Compile anything
 * @param options
 */
function compile(options) {

  let {sources, cwd, watch, sync} = options;

  if(sync) {

    watch = true;
  }

  let scripts = [];
  let styles = [];

  cwd = path.resolve(cwd);

  sources.forEach((source) => {

    source = path.resolve(cwd, source);

    const files = glob.hasMagic(source) ? glob.sync(source): [source];

    files.forEach((file)=> {

      const {ext} = path.parse(file);
      const relativePath = path.relative(cwd, file)

      if(ext === '.jsx' || ext === '.js') {

        return scripts.push(relativePath);
      }

      if(ext === '.styl') {

        return styles.push(relativePath);
      }

    })
  })

  const hasScripts = !!scripts.length;
  const hasStyles = !!styles.length;

  let scriptsPromise = hasScripts ? compileScripts({...options, sources: scripts, watch}) : Promise.resolve();
  let stylesPromise = hasStyles ? compileStyles({...options, sources: styles, watch}): Promise.resolve();

  return Promise.all([scriptsPromise, stylesPromise])
    .then((results)=> {

      if(!watch) {

        return results;
      }

      const [scriptsCompiler, stylesCompiler] = results;

      if(sync) {

        let syncInstance = createSync({proxy: sync});

        hasScripts && scriptsCompiler.onChange(()=> syncInstance.reload('*'));
        hasStyles && stylesCompiler.onChange(()=> syncInstance.reload('*.css'));
      }

      const instance = proxyMethods(['onChange', 'removeChangeListener', 'close'], [scriptsCompiler, stylesCompiler]);

      createFilesHasChangedPromise(instance);

      return instance;
    })
}


function proxyMethods(methods, instances) {

  const instance = {};

  methods.forEach((method)=> {

    instance[method] = (arg) => {

      instances.forEach((i) => i && i[method](arg))
    }
  })

  return instance;
}

function createFilesHasChangedPromise(instance) {

  instance.filesHasChanged = new Promise((resolve) => {

    instance.onChange(fileHasChangedlistener);

    function fileHasChangedlistener() {

      instance.removeChangeListener(fileHasChangedlistener);

      process.nextTick(()=> createFilesHasChangedPromise(instance));
      resolve();
    }
  })
}


module.exports = {

  compile,
  compileScripts,
  compileStyles,
}
