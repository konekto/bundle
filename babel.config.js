module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: ["last 2 versions", "ie >= 11"]
          }
        }
      ],
      "@babel/preset-react"
    ],
    plugins: [
      "react-hot-loader/babel",
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-object-rest-spread"
    ]
  };
};
