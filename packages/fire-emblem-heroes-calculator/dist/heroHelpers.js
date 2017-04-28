'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasStatsForRarity = exports.getWeaponColor = exports.getMitigationType = exports.getRange = exports.getStat = exports.hasBraveWeapon = exports.hasSkill = exports.lookupStats = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getSkillName = getSkillName;
exports.getSkillEffect = getSkillEffect;
exports.getDefaultSkills = getDefaultSkills;
exports.updateRarity = updateRarity;
exports.getInheritableSkills = getInheritableSkills;
exports.hpAboveThreshold = hpAboveThreshold;
exports.hpBelowThreshold = hpBelowThreshold;

var _fireEmblemHeroesStats = require('fire-emblem-heroes-stats');

var _fireEmblemHeroesStats2 = _interopRequireDefault(_fireEmblemHeroesStats);

var _ramda = require('ramda');

var _skillHelpers = require('./skillHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// $FlowIssue indexBy confuses flow
var heroesByName = (0, _ramda.indexBy)((0, _ramda.prop)('name'),
// stats.heroes,
(0, _ramda.concat)(_fireEmblemHeroesStats2.default.heroes, (0, _fireEmblemHeroesStats.getEventHeroes)(true)));

/**
 * Look up a hero's base stats by name.
 *
 * @param {string} name The name of the hero to look up.
 * @returns {Hero} A raw hero object, from fire-emblem-heroes-stats.
 */
var lookupStats = exports.lookupStats = function lookupStats(name) {
  var hero = heroesByName[name];
  return hero || heroesByName['Anna'] || {
    name: name,
    weaponType: 'Red Sword',
    stats: { '1': {}, '40': {} },
    skills: [],
    moveType: 'Infantry'
  };
};

// Can be called with substrings of the skill name. Returns false if an hp requirement is not met.
var hasSkill = exports.hasSkill = function hasSkill(instance, skillType, expectedName) {
  var skillName = getSkillName(instance, skillType);
  if (skillName !== undefined) {
    if ((0, _ramda.test)(new RegExp(expectedName), skillName)) {
      return (0, _skillHelpers.hpRequirementSatisfied)(instance, skillName);
    }
  }
  return false;
};

// Returns the name of the skill object for the skill type
function getSkillName(instance, skillType) {
  return instance.skills[skillType] || '';
}

// Returns the effect description of a skill
function getSkillEffect(instance, skillType) {
  var skill = (0, _skillHelpers.getSkillInfo)(instance.skills[skillType]);
  return skill ? skill.effect : '';
}

// Returns a map from skill type to the skill object.
function getDefaultSkills(name) {
  var rarity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  var hero = lookupStats(name);

  // Flow can't follow this compose chain, so cast it to any.
  var skillsByType = (0, _ramda.compose)((0, _ramda.map)((0, _ramda.prop)('name')), (0, _ramda.indexBy)(function (skill) {
    return skill.type;
  }), (0, _ramda.filter)((0, _ramda.compose)(_ramda.not, _ramda.isNil)), (0, _ramda.map)(function (skill) {
    return (0, _skillHelpers.getSkillInfo)(skill.name);
  }), (0, _ramda.filter)(function (skill) {
    return skill.rarity === undefined || skill.rarity === '-' || skill.rarity <= rarity;
  }))(hero.skills);

  return _extends({
    WEAPON: undefined,
    ASSIST: undefined,
    SPECIAL: undefined,
    PASSIVE_A: undefined,
    PASSIVE_B: undefined,
    PASSIVE_C: undefined,
    SEAL: undefined
  }, skillsByType);
}

// Updates the rarity and default skills for a hero.
function updateRarity(hero, newRarity) {
  var oldDefault = getDefaultSkills(hero.name, hero.rarity);
  var newDefault = getDefaultSkills(hero.name, newRarity);
  return _extends({}, hero, {
    rarity: newRarity,
    // $FlowIssue Function cannot be called on member of intersection type
    skills: (0, _ramda.mapObjIndexed)(function (skill, skillType) {
      return (0, _ramda.propOr)('', 'name', skill) === (0, _ramda.propOr)('', 'name', oldDefault[skillType]) ? newDefault[skillType] : skill;
    }, hero.skills)
  });
}

// skill is 'any' because some fields are weapon/passive specific
var canInherit = (0, _ramda.curry)(function (hero, skill) {
  var moveType = hero.moveType;
  var weaponType = hero.weaponType;
  if ((0, _ramda.propEq)('exclusive?', 'Yes', skill)) {
    return false;
  }
  // Unobtainable weapons (story only) currently have no weapon type.
  // Hero has weaponType 'Red Beast' and weapon has weaponType 'Breath'
  if (skill.type === 'WEAPON' && (skill.weaponType === undefined || ((0, _ramda.test)(/Beast/, weaponType) ? 'Breath' : weaponType) !== skill.weaponType)) {
    return false;
  }
  var restriction = (0, _ramda.propOr)('None', 'inheritRestriction', skill);
  switch (restriction) {
    case 'Axe Users Only':
      return weaponType === 'Green Axe';
    case 'Bow Users Only':
      return weaponType === 'Neutral Bow';
    case 'Fliers Only':
      return moveType === 'Flying';
    case 'Cavalry Only':
      return moveType === 'Cavalry';
    case 'Armored Only':
      return moveType === 'Armored';
    case 'Excludes Fliers':
      return moveType !== 'Flying';
    case 'Melee Weapons Only':
    case 'Melee Weapon Users Only':
      return (0, _ramda.test)(/(Sword|Axe|Lance|Breath)/, weaponType);
    case 'Ranged Weapons Only':
    case 'Ranged Weapon Users Only':
      return (0, _ramda.test)(/(Staff|Tome|Bow|Shuriken)/, weaponType);
    case 'Breath Users Only':
      return (0, _ramda.test)(/Breath/, weaponType);
    case 'Staff Only':
    case 'Staff Users Only':
      return weaponType === 'Neutral Staff';
    case 'Excludes Staves':
    case 'Excludes Staff Users':
      return weaponType !== 'Neutral Staff';
    case 'Excludes Colorless Weapons':
    case 'Excludes Colorless Weapon Users':
      return !(0, _ramda.test)(/Neutral/, weaponType);
    case 'Excludes Blue Weapons':
    case 'Excludes Blue Weapon Users':
      return !(0, _ramda.test)(/Blue/, weaponType);
    case 'Excludes Red Weapons':
    case 'Excludes Red Weapon Users':
      return !(0, _ramda.test)(/Red/, weaponType);
    case 'Excludes Green Weapons':
    case 'Excludes Green Weapon Users':
      return !(0, _ramda.test)(/Green/, weaponType);
    case 'Is exclusive':
      return false;
    case 'None':
      return true;
    default:
    // console.log('Warning: unknown inherit restriction: ' + restriction);
  }
  return true;
});

// Returns a list of skills that a hero can obtain.
function getInheritableSkills(name, skillType) {
  var hero = lookupStats(name);
  // Cast to any to prevent flow issues
  var allSkills = _fireEmblemHeroesStats2.default.skills;
  var inheritable = (0, _ramda.filter)((0, _ramda.allPass)([
  // $FlowIssue canInherit is curried
  canInherit(hero), (0, _ramda.propEq)('type', skillType)]), allSkills);
  var ownSkills = (0, _ramda.compose)((0, _ramda.filter)(function (x) {
    return (0, _ramda.propOr)('', 'type', x) === skillType;
  }), (0, _ramda.map)(_skillHelpers.getSkillInfo), (0, _ramda.map)((0, _ramda.prop)('name')))(hero.skills);
  return (0, _ramda.sort)((0, _ramda.ascend)((0, _ramda.prop)('name')), (0, _ramda.union)(inheritable, ownSkills));
}

var hasBraveWeapon = exports.hasBraveWeapon = (0, _ramda.compose)((0, _ramda.test)(/Brave|Dire/), (0, _ramda.pathOr)('', ['skills', 'WEAPON']));

/**
 * A helper for getting a stat value from a hero by key.
 * Defaults to level 40, 5 star, baseline variant.
 *
 * @param {*} hero Hero to look up stat on
 * @param {*} statKey Key of the stat to look up
 * @param {*} level Which level version of stat to look up
 * @param {*} rarity Which rarity version of stat to look up
 * @param {*} variance Which variant ('low', 'normal', 'high') to look up
 * @param {*} isAttacker Whether or not the hero is the attacker.
 * @returns number the value of the stat
 */
var getStat = exports.getStat = function getStat(instance, statKey) {
  var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 40;
  var isAttacker = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var hero = lookupStats(instance.name);
  var rarity = instance.rarity;

  var variance = instance.boon === statKey ? 'high' : instance.bane === statKey ? 'low' : 'normal';

  if (level === 1) {
    var value = parseInt(hero.stats['' + level][rarity][statKey], 10);
    // skills and merges are currently not included in level 1 stats.
    return variance === 'normal' ? value : variance === 'low' ? value - 1 : value + 1;
  }

  var values = hero.stats['' + level][rarity][statKey];

  var _ref = values.length <= 1 ? ['-'].concat(_toConsumableArray(values)) : values,
      _ref2 = _slicedToArray(_ref, 3),
      low = _ref2[0],
      normal = _ref2[1],
      high = _ref2[2];

  var baseValue = variance === 'normal' ? parseInt(normal, 10) : variance === 'low' ? parseInt(low, 10) : parseInt(high, 10);

  // Every bonus level gives +1 to the next 2 stats, with stats in decreasing level 1 order
  var statKeys = ['hp', 'atk', 'spd', 'def', 'res'];
  // Depends on the fact that level 1 stats currently exclude skills.
  // $FlowIssue function cannot be called on any member of intersection type.
  var level1Stats = (0, _ramda.zipObj)(statKeys, (0, _ramda.map)(function (s) {
    return getStat(instance, s, 1, false);
  }, statKeys));
  var orderedStatKeys = (0, _ramda.sortWith)([(0, _ramda.descend)((0, _ramda.prop)(_ramda.__, level1Stats)), (0, _ramda.ascend)((0, _ramda.indexOf)(_ramda.__, statKeys))], statKeys);
  var mergeBonus = Math.floor(2 * instance.mergeLevel / 5) + (2 * instance.mergeLevel % 5 > (0, _ramda.indexOf)(statKey, orderedStatKeys) ? 1 : 0);

  // TODO: buffs and Defiant abilities
  return baseValue + mergeBonus + (0, _skillHelpers.getStatValue)(instance, 'PASSIVE_A', statKey, isAttacker) + (0, _skillHelpers.getStatValue)(instance, 'SEAL', statKey, isAttacker) + (0, _skillHelpers.getStatValue)(instance, 'WEAPON', statKey, isAttacker);
};

var getRange = exports.getRange = function getRange(instance) {
  return (0, _ramda.test)(/Sword|Axe|Lance|Beast/, lookupStats(instance.name).weaponType) ? 1 : 2;
};

var getMitigationType = exports.getMitigationType = function getMitigationType(instance) {
  return (0, _ramda.test)(/Tome|Beast|Staff/, lookupStats(instance.name).weaponType) ? 'res' : 'def';
};

var getWeaponColor = exports.getWeaponColor = function getWeaponColor(instance) {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Sword':
    case 'Red Tome':
    case 'Red Beast':
      return 'RED';
    case 'Green Axe':
    case 'Green Tome':
    case 'Green Beast':
      return 'GREEN';
    case 'Blue Lance':
    case 'Blue Tome':
    case 'Blue Beast':
      return 'BLUE';
    default:
      return 'NEUTRAL';
  }
};

var hasStatsForRarity = exports.hasStatsForRarity = function hasStatsForRarity(hero, rarity) {
  return Boolean(hero.stats['1']['' + rarity] && hero.stats['40']['' + rarity]);
};

// Returns whether or not hp >= X% of hp, using the hp at the start of combat.
function hpAboveThreshold(hero, hpPercent) {
  return getStat(hero, 'hp') - hero.initialHpMissing >= getStat(hero, 'hp') * hpPercent / 100;
}

// Returns whether or not hp <= X% of hp, using the hp at the start of combat.
function hpBelowThreshold(hero, hpPercent) {
  return getStat(hero, 'hp') - hero.initialHpMissing <= getStat(hero, 'hp') * hpPercent / 100;
}