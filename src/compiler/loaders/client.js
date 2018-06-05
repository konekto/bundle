const replaceRegexp = /index\.jsx/g;

/**
 * simple View Preloader that loads the client files instead of the server files
 * @param content
 * @returns {*}
 */


module.exports = function viewPreloader(content) {

  this.cacheable();

  const callback = this.async();

  return process.nextTick(()=> callback(null, content.replace(replaceRegexp, 'client.jsx')));
};
