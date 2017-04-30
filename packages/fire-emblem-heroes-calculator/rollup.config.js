// @flow
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  moduleName: 'calculator',
  format: 'umd',
  plugins: [
    resolve(),
    commonjs({
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
        ] ,
      },
    }),
    babel({
      babelrc: false,
      presets: [['es2015', { modules: false }], 'stage-2'],
      plugins: ['transform-flow-strip-types', 'ramda'],
    }),
  ],
  dest: 'dist/index.js',
};
