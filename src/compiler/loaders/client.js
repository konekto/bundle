const path = require('path');
const fs = require('fs');
const replaceRegexp = /index\.jsx/g;

/**
 * simple View Preloader that loads the client files instead of the server files
 * @param content
 * @returns {*}
 */


module.exports = function viewPreloader(content) {

  this.cacheable();

  const callback = this.async();
  const stylePath = path.resolve(this.context, 'styles.styl');

  exists(stylePath)
    .then((loadStyle) => {

      if (loadStyle) {
        content = `require("${stylePath}")\n` + content;
      }

      callback(null, content.replace(replaceRegexp, 'client.jsx'))
    })
};


function exists(file) {

  return new Promise((resolve) => {

    fs.access(file, fs.constants.F_OK, (err) => {

      return resolve(!err)
    })
  })
}
