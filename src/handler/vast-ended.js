import $trigger from '../trigger'
import {$removeAll} from '../toggles'

export default function () {
  if (this._destroyed) return

  $removeAll.call(this)
  $trigger.call(this, 'AdStopped')
}
