// @flow
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  moduleName: 'stats',
  format: 'umd',
  plugins: [
    resolve(),
    json(),
    commonjs(),
    babel({
      babelrc: false,
      presets: [['es2015', { modules: false }], 'stage-2'],
      plugins: ['transform-flow-strip-types', 'ramda'],
    }),
  ],
  dest: 'dist/index.js',
};
