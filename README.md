# Bundle

Well bundle should be your last almost zero-config assets bundler for modern frontend development. 
It supports stylus for styles and babel through webpack.

## Installation

`npm install -g @konekto/bundle`

## Usage
Just launch the globally installed cli `bundle` and it will look for a `.bundlerc` file in your project tree.
Configure babel with your `.babelrc` and your good to go.

## .bundlerc

```js
{
  "cwd": "./src" , //parent folder   
  "destination": "./build" //destination folder,
  "sources": ["**/*.jsx", "**/*.styl"], //source glogs to compile relative to cwd,
  "watch": true, //watch files,
  "loader": true, //activate auto component loader
  "sync": "http://localhost:8080", //page reload proxy with browsersync
  "log": true //activate logging
}
``` 

See `bundle --help` for equivalent counterparts cli arguments.
