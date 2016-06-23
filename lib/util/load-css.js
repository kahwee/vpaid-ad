'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (url) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  // parent returns Window object
  parent.document.body.appendChild(link);
  return link;
};