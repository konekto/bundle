const path = require('path');
const fs = require('fs');
const replaceRegexp = /index\.jsx/g;


/**
 * simple View Preloader that loads the client files instead of the server files
 * @param content
 * @returns {*}
 */

module.exports = function clientLoader(content) {

  this.cacheable();
  const callback = this.async();

  loader(this, content)
    .then((c) => callback(null, c))
    .catch(callback);
};

async function loader(ctx, content) {

  return await addStyle(ctx, content.replace(replaceRegexp, 'client.jsx'))
}

async function addStyle(ctx, content) {

  const { context } = ctx;
  const stylePath = path.resolve(context, 'styles.styl');

  const styleExists = await exists(stylePath);

  if (!styleExists) return content;

  return `require("${stylePath}")\n` + content;
}

function exists(file) {

  return new Promise((resolve) => {

    fs.access(file, fs.constants.F_OK, (err) => {

      return resolve(!err)
    })
  })
}

