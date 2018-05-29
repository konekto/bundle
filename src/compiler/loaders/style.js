const fs = require('fs');
const path = require('path');


module.exports = function styleLoader(content) {

  const {resourcePath} = this;
  const {dir} = path.parse(resourcePath);
  const styleFile = path.resolve(dir, 'styles.styl')

  this.cacheable();
  const callback = this.async();


  fs.access(styleFile, fs.constants.F_OK, (err) => {

    if(err) return callback(null, content);

    this.addDependency(styleFile);

    callback(null,  'require("./styles.styl");\n'+ content);
  });
};
