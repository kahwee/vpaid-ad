'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if (this._destroyed) return;

  _toggles.$removeAll.call(this);
  this.emit('AdStopped');
};

var _toggles = require('../toggles');