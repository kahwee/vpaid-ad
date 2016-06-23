'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$toggleExpand = $toggleExpand;
exports.$togglePlay = $togglePlay;
exports.$toggleUI = $toggleUI;
exports.$removeAll = $removeAll;

var _trigger = require('./trigger');

var _trigger2 = _interopRequireDefault(_trigger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function $toggleExpand(toExpand) {
  $toggleUI.call(this, toExpand);
  $togglePlay.call(this, toExpand);

  this._attributes.expandAd = toExpand;
  this._attributes.remainingTime = toExpand ? -2 : -1;

  _trigger2.default.call(this, 'AdExpandedChange');
  _trigger2.default.call(this, 'AdDurationChange');
}

function $togglePlay(toPlay) {
  if (toPlay) {
    this._videoSlot.pause();
  } else {
    this._videoSlot.play();
  }
}

function $toggleUI(show) {
  this._ui.interact.style.display = getDisplay();
  this._ui.xBtn.style.display = getDisplay();

  function getDisplay() {
    return show ? 'block' : 'none';
  }
}

function $removeAll() {
  this._destroyed = true;
  this._videoSlot.src = '';
  this._style.parentElement.removeChild(this._style);
  this._slot.innerHTML = '';
  this._ui = null;
}