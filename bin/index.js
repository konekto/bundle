#!/usr/bin/env node
"use strict";

const meow = require("meow");

const { compile } = require("../src/compiler");
const { load } = require("../src/config");
const storybook = require("../src/storybook");

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
      --storybook load storybook 
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

  const { flags } = cli;
  const rcConfig = load(flags);

  let init = Promise.resolve();

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

  if (config.storybook) {
    storybook(config);
  }

  init
    .then(() => compile(config))
    .then(_inst => (instance = _inst))
    .catch(err => {
      close();
      console.log(err);
    });
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
