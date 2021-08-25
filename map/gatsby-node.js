exports.onCreateWebpackConfig = ({ stage, rules, loaders, plugins, actions }) => {
  actions.setWebpackConfig({
    resolve: {
      // These are node modules required by realm-web that must be polyfilled when using Webpack 5
      // https://github.com/webpack/webpack/issues/11282
      fallback: {
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      },
    },
  });
};
