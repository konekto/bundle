const browserSync = require("browser-sync");

const defaultOptions = {
  port: 3010,
  ghostMode: false
};


module.exports = function sync(options) {

  options = Object.assign({}, defaultOptions, options);

  return browserSync(options);
}
