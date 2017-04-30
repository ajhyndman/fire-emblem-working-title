'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getReleasedHeroes = exports.getHero = exports.getAllHeroes = undefined;

var _ramda = require('ramda');

var _stats = require('./stats.json');

var _stats2 = _interopRequireDefault(_stats);

var _events = require('./temporal/events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line import/no-unresolved
var getAllHeroes = exports.getAllHeroes = function getAllHeroes() {
  return (0, _ramda.concat)(_stats2.default.heroes, (0, _events.getEventHeroes)(true));
};

// $FlowIssue indexBy confuses flow
var heroesByName = (0, _ramda.indexBy)((0, _ramda.prop)('name'), getAllHeroes());

/**
 * Look up a hero's base stats by name.
 *
 * @param {string} name The name of the hero to look up.
 * @returns {Hero} A raw hero object, from fire-emblem-heroes-stats.
 */
var getHero = exports.getHero = function getHero(name) {
  var hero = heroesByName[name];
  return hero || heroesByName['Anna'] || {
    name: name,
    weaponType: 'Red Sword',
    stats: { '1': {}, '40': {} },
    skills: [],
    moveType: 'Infantry'
  };
};

var getReleasedHeroes = exports.getReleasedHeroes = function getReleasedHeroes() {
  return (0, _ramda.filter)(function (hero) {
    return (0, _ramda.propOr)('N/A', 'releaseDate', hero) !== 'N/A';
  }, _stats2.default.heroes);
};