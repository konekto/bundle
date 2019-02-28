const rc = require("rc");
const fs = require("fs");

module.exports = { load };

function load(flags = {}) {
  const defaultConfig = {
    log: true,
    loader: true,
    sources: ["*.js"],
    cwd: ".",
    destination: "./build"
  };

  console.log("");
  console.log("Looking for .bundlerc ...");

  if (flags.config) {
    console.log(" found ", flags.config);

    const fileConfig = JSON.parse(fs.readFileSync(flags.config, "utf8"));

    module.exports.config = {
      ...defaultConfig,
      ...fileConfig
    };

    return module.exports.config;
  }

  const rcConfig = rc("bundle", defaultConfig);

  if (rcConfig.config === undefined) {
    console.log(" No .bundlerc found in working directory or above.");
    console.log(" Will use defaults: ");
    console.log(rcConfig);
    console.log(
      "To make your own .bundlerc copy the following line and place it in a file in your project:"
    );
    console.log(JSON.stringify(defaultConfig));
  } else {
    console.log("  found: ", rcConfig.config);
  }
  console.log("");

  module.exports.config = rcConfig;

  return module.exports.config;
}
