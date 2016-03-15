import $trigger from './trigger';

export function $toggleExpand(toExpand) {
  $toggleUI.call(this, toExpand);
  $togglePlay.call(this, toExpand);

  this._attributes.expandAd = toExpand;
  this._attributes.remainingTime = toExpand ? -2 : -1;

  $trigger.call(this, 'AdExpandedChange');
  $trigger.call(this, 'AdDurationChange');
}

export function $togglePlay(toPlay) {
  if (toPlay) {
    this._videoSlot.pause();
  } else {
    this._videoSlot.play();
  }
}

export function $toggleUI(show) {
  this._ui.interact.style.display = getDisplay();
  this._ui.xBtn.style.display = getDisplay();

  function getDisplay() {
    return show ? 'block' : 'none';
  }
}

export function $removeAll() {
  this._destroyed = true;
  this._videoSlot.src = '';
  this._style.parentElement.removeChild(this._style);
  this._slot.innerHTML = '';
  this._ui = null;
}