#!/usr/bin/env node
"use strict";

const meow = require('meow');
const rc = require('rc');
const {compile} = require('../src/compiler');

let instance;

// called directly
if (require.main === module) {
  init_cli();
}

function init_cli() {

  const cli = meow(`
		Usage
			$ bundle

		Options
			--config config file path
			--sync proxy url to sync
			--watch watch files for chages
			--loader activate loader
			--log show logs
			--cwd set cwd
			--dest destination path
			--src source glob

		Examples
			$ bundler --sync
	`,
    {
      alias: {
        c: 'config',
        l: 'loader',
        w: 'watch',
        d: 'dest',
        s: 'src'
      }
    }
  );

  const rcConfig = rc('bundle', {
    log: true,
    loader: true,
  });

  const {flags} = cli;

  if(flags.src) {

    flags.sources = [flags.src];
  }

  if(flags.dest) {

    flags.destination = flags.dest;
  }

  const config = {
    ...rcConfig,
    ...flags
  };

  compile(config)
    .then((_inst)=> instance = _inst)
    .catch((err)=> {

      instance.close && instance.close();
      console.log(err)
    })
}


process.on('SIGINT', () => {

  instance && instance.close && instance.close();
  process.exit();
});
