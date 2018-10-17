"use strict";

module.exports = function (el, size) {
  el.width = size[0];
  el.height = size[1]; // Just in case .style is not defined. This does happen in cases
  // where video players pass in mock DOM objects. Like Google IMA

  if (el.style) {
    el.style.width = size[0] + 'px';
    el.style.height = size[1] + 'px';
  }
};