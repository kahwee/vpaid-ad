import {$removeAll} from '../toggles'

export default function () {
  if (this._destroyed) return

  $removeAll.call(this)
  this.emit('AdStopped')
}
