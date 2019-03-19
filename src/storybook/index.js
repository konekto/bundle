const path = require("path");
const build = require("@storybook/react/standalone");

module.exports = function run(options) {
  console.log("starting storybook");
  console.log("loading stories in ", options.cwd);

  return build({
    mode: 'dev',
    configDir: path.resolve(__dirname),
    staticDir: [options.destination],
    port: 9001,
    ci: true
  });
};
