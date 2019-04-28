// @flow
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

const config = {
  input: 'src/index.js',
  output: {
    file: 'dist/fire-emblem-heroes-stats.js',
    format: 'umd',
    name: 'stats',
    exports: 'named',
  },
  plugins: [
    resolve(),
    json(),
    commonjs({
      exclude: 'src/**',
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env', { modules: false }]],
      plugins: ['@babel/plugin-transform-flow-strip-types', 'ramda'],
    }),
  ],
};

if (process.env.BUILD === 'production') {
  config.output.file = 'dist/fire-emblem-heroes-stats.min.js';
  config.plugins.push(uglify());
}

export default config;
