// @flow
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

const config = {
  moduleName: 'stats',
  format: 'umd',
  plugins: [
    resolve(),
    json(),
    commonjs(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [['es2015', { modules: false }], 'stage-2'],
      plugins: ['transform-flow-strip-types', 'ramda'],
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify());
}

export default config;
