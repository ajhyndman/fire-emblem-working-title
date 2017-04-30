'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _damageCalculation = require('./damageCalculation');

Object.defineProperty(exports, 'calculateResult', {
  enumerable: true,
  get: function get() {
    return _damageCalculation.calculateResult;
  }
});

var _heroHelpers = require('./heroHelpers');

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
Object.defineProperty(exports, 'updateRarity', {
  enumerable: true,
  get: function get() {
    return _heroHelpers.updateRarity;
  }
});

var _heroInstance = require('./heroInstance');

Object.defineProperty(exports, 'getDefaultInstance', {
  enumerable: true,
  get: function get() {
    return _heroInstance.getDefaultInstance;
  }
});

var _skillHelpers = require('./skillHelpers');

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