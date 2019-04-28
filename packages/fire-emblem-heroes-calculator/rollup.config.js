// @flow
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

const config = {
  input: 'src/index.js',
  output: {
    file: 'dist/fire-emblem-heroes-calculator.js',
    format: 'umd',
    name: 'calculator',
  },
  plugins: [
    resolve(),
    commonjs({
      exclude: 'src/**',
      // explicitly specify unresolvable named exports
      // (see https://github.com/rollup/rollup-plugin-commonjs for more details)
      namedExports: {
        '../fire-emblem-heroes-stats/dist/fire-emblem-heroes-stats.js': [
          'getAllHeroes',
          'getAllSkills',
          'getEventHeroes',
          'getHero',
          'getReleasedHeroes',
          'getSkillObject',
          'getSkillType',
        ],
      },
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
  config.output.file = 'dist/fire-emblem-heroes-calculator.min.js';
  config.plugins.push(uglify());
}

export default config;
