import $trigger from '../trigger'

export default function () {
  if (this._destroyed) return

  var videoSlot = this._videoSlot
  var percentPlayed = _mapNumber(0, videoSlot.duration, 0, 100, videoSlot.currentTime)
  var last = this._lastQuartilePosition

  if (percentPlayed < last.position) return

  if (last.hook) last.hook()

  $trigger.call(this, last.event)

  var quartile = this._quartileEvents
  this._lastQuartilePosition = quartile[ quartile.indexOf(last) + 1 ]
}
