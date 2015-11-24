import $trigger from '../trigger'

export default function () {
  const clickThru = this._parameters.clickThru || {
    url: 'http://www.example.com',
    trackID: 123,
    playerHandles: false
  }

  $trigger.call(this, 'AdClickThru', [clickThru.url, clickThru.trackID, clickThru.playerHandles])

  // Babel 6 can'mt seem to compile this
  // if (!clickThru.playerHandles) {
  //   window.open(clickThru.url, '_blank')
  // }
}
