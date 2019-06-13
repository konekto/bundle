const path = require("path");
const webpack = require("../webpack");
const { getWebpackEntries, normalizeOptions } = require("../utils");
const Promise = require("bluebird");
const { resolve } = require;
const styles = require('./styles');

const clientLoader = {
  test: /index\.jsx$/,
  exclude: /node_modules/,
  loader: path.resolve(__dirname, "./loaders/client.js")
};

const babelLoaderConfig = {
  presets: [
    [
      resolve("@babel/preset-env"),
      {
        targets: {
          browsers: ["last 2 versions", "ie >= 11"]
        }
      }
    ],
    resolve("@babel/preset-react")
  ],
  plugins: [
    resolve("react-hot-loader/babel"),
    resolve("@babel/plugin-proposal-export-default-from"),
    resolve("@babel/plugin-proposal-object-rest-spread")
  ]
};

// exports
module.exports = compileScripts;
module.exports.getWebpackConfig = getWebpackConfig;

/**
 * compile scripts given the options
 * @param options
 * @returns {PromiseLike<T> | Promise<T>}
 */
function compileScripts(options) {
  return webpack(getWebpackConfig(options), options);
}

function getWebpackConfig(options) {
  const { destination, mode, loader } = normalizeOptions(options);

  const entries = getWebpackEntries(options, "js");

  const styleConfig = styles.getWebpackConfig({ ...options, loader: false });

  const clientLoaders = loader ? [clientLoader] : [];
  const styleRules = loader ? styleConfig.module.rules : [];
  const plugins = loader ? styleConfig.plugins : [];

  console.log("");
  console.log("Generating scripts webpack config...");
  console.log("  mode: ", mode);
  console.log("  destination: ", destination);
  console.log("  entry: ", entries);
  console.log("");

  return {
    mode: mode,
    devtool: mode === "development" ? "eval" : "nosources-source-map",
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: "[name].js",
      publicPath: "/"
    },
    cache: true,
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: resolve("babel-loader"),
          options: {
            ...babelLoaderConfig,
            cacheDirectory: true,
          }
        },
        ...clientLoaders,
        ...styleRules
      ]
    },
    plugins
  };
}
