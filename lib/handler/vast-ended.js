'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if (this._destroyed) return;

  _toggles.$removeAll.call(this);
  _trigger2.default.call(this, 'AdStopped');
};

var _trigger = require('../trigger');

var _trigger2 = _interopRequireDefault(_trigger);

var _toggles = require('../toggles');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }