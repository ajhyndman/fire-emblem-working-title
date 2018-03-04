// @flow
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  webpack: (config: Object, { dev }: { dev: boolean }) => {
    if (dev) {
      return config;
    }

    config.plugins.push(
      new SWPrecacheWebpackPlugin({
        minify: true,
        verbose: true,
        staticFileGlobsIgnorePatterns: [/\.next\//],
        runtimeCaching: [
          {
            handler: 'networkFirst',
            urlPattern: /^https?.*/,
          },
        ],
      }),
    );

    return config;
  },
};
