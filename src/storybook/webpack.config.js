const webpack = require("webpack");
const path = require("path");
const { config } = require("../config");
const { compileStyles, compileScripts } = require("../compiler");

const options = {
  ...config,
  destination: "",
  sources: [],
  sync: false,
  watch: false
};

module.exports = storybookBaseConfig => {
  const stylesConfig = compileStyles.getWebpackConfig(options);
  const scriptsConfig = compileScripts.getWebpackConfig(options);

  // patch styling
  const styleRules = stylesConfig.module.rules;
  styleRules[0].use[0] = "style-loader";

  storybookBaseConfig.module.rules = storybookBaseConfig.module.rules
    .concat(styleRules)
    .concat(scriptsConfig.module.rules);

  storybookBaseConfig.plugins.push(
    new webpack.DefinePlugin({
      DESTINATION: JSON.stringify(path.resolve(process.cwd(), config.cwd))
    })
  );

  return storybookBaseConfig;
};
