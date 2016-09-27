'use strict';

var el = void 0;
module.exports = function (type) {
  if (!el) {
    el = document.createElement('video');
  }
  return !!el.canPlayType(type).replace(/no/, '');
};