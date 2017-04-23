'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _damageCalculation = require('../src/damageCalculation');

Object.defineProperty(exports, 'calculateResult', {
  enumerable: true,
  get: function get() {
    return _damageCalculation.calculateResult;
  }
});

var _heroHelpers = require('../src/heroHelpers');

Object.defineProperty(exports, 'getDefaultSkills', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.getDefaultSkills;
  }
});
Object.defineProperty(exports, 'getInheritableSkills', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.getInheritableSkills;
  }
});
Object.defineProperty(exports, 'getStat', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.getStat;
  }
});
Object.defineProperty(exports, 'hasStatsForRarity', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.hasStatsForRarity;
  }
});
Object.defineProperty(exports, 'lookupStats', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.lookupStats;
  }
});
Object.defineProperty(exports, 'updateRarity', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.updateRarity;
  }
});

var _heroInstance = require('../src/heroInstance');

Object.defineProperty(exports, 'getDefaultInstance', {
  enumerable: true,
  get: function get() {
    return _heroInstance.getDefaultInstance;
  }
});

var _skillHelpers = require('../src/skillHelpers');

Object.defineProperty(exports, 'getSkillInfo', {
  enumerable: true,
  get: function get() {
    return _skillHelpers.getSkillInfo;
  }
});
Object.defineProperty(exports, 'getSpecialCooldown', {
  enumerable: true,
  get: function get() {
    return _skillHelpers.getSpecialCooldown;
  }
});
Object.defineProperty(exports, 'isMaxTier', {
  enumerable: true,
  get: function get() {
    return _skillHelpers.isMaxTier;
  }
});