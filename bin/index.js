#!/usr/bin/env node
"use strict";

const meow = require("meow");
const rc = require("rc");
const path = require("path");

const { compile } = require("../src/compiler");

let instance;

// called directly
if (require.main === module) {
  init_cli();
}

function init_cli() {
  const cli = meow(
    `
		Usage
			$ bundle

		Options
			--config config file path
			--sync proxy url to sync
			--watch watch files for chages
			--loader activate loader
			--log show logs
			--cwd set cwd
			--install install babel deps
			--dest destination path
			--src source glob
			--mode production or development

		Examples
			$ bundler --sync
	`,
    {
      alias: {
        i: "install",
        c: "config",
        l: "loader",
        w: "watch",
        d: "dest",
        s: "src"
      }
    }
  );
  console.log("Starting your bundler experience!");
  console.log("Working directory:");
  console.log(" ", process.cwd());

  const defaultConfig = {
    log: true,
    loader: true,
    sources: ["*.js"],
    cwd: ".",
    destination: "./build"
  };
  const rcConfig = rc("bundle", defaultConfig);

  console.log("");
  console.log("Looking for .bundlerc ...");

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

  const { flags } = cli;
  let init = Promise.resolve();

  if (flags.install) {
    init = installBabelDeps();
  }

  if (flags.src) {
    flags.sources = [flags.src];
  }

  if (flags.dest) {
    flags.destination = flags.dest;
  }

  if (flags.mode === "production") {
    flags.sync = false;
  }

  const config = {
    ...rcConfig,
    ...flags
  };

  init
    .then(() => compile(config))
    .then(_inst => (instance = _inst))
    .catch(err => {
      close();
      console.log(err);
    });
}

function installBabelDeps() {
  let results = [];
  const babelDefaults = {
    presets: [
      [
        "env",
        {
          targets: {
            browsers: ["last 2 versions", "ie >= 11"]
          }
        }
      ],
      "react"
    ],
    plugins: [
      "react-hot-loader/babel",
      "transform-object-rest-spread",
      "transform-export-default"
    ]
  };

  console.log("Looking for .babelrc...");

  const babelConfig = rc("babel", babelDefaults);

  if (babelConfig.config === undefined) {
    console.log("  No .babelrc found in working directory or above.");
    console.log("  Will use defaults: ");
    console.log("");
    console.log(babelDefaults);
    console.log("");
    console.log(
      "To make your own .babelrc, copy the following line and place it in a file in your project:"
    );
    console.log(JSON.stringify(babelDefaults));
    console.log("This will also enable you to use to babel auto install");
  } else {
    console.log("  found: ", babelConfig.config);
    console.log("  Ensuring babel dependencies installed:");

    const babelPresets = babelConfig.presets.map(p =>
      babelConfigToPackagename(p, "preset")
    );
    const babelPlugins = babelConfig.plugins.map(p =>
      babelConfigToPackagename(p, "plugin")
    );
    const npm = require("npmi");
    const targetWorkingDir = path.dirname(babelConfig.config);

    console.log("  Needed dependencies: ");
    console.log("  Will install into: ", targetWorkingDir);

    const babelDeps = babelPresets.concat(babelPlugins);

    results = babelDeps.map(each => {
      console.log("   ", each);
      return new Promise((resolve, reject) => {
        npm({ name: each, path: targetWorkingDir }, (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(res);
        });
      });
    });
  }
  console.log("");
  console.log("");
  return Promise.all(results);
}

function babelConfigToPackagename(preset, middle) {
  let name;
  if (Array.isArray(preset)) name = preset[0];
  else name = preset;

  return "babel-" + middle + "-" + name.split("/")[0];
}

function close() {
  console.log("Closing instance explicityly.");

  instance && instance.close && instance.close();
}

process.on("SIGINT", () => {
  close();
  process.exit();
});

process.on("SIGTERM", () => {
  close();
  process.exit();
});
