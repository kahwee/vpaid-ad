export default function () {
  const clickThru = this.opts.clickThru || {
    url: 'http://www.example.com',
    trackID: 123,
    playerHandles: false
  }
  this.emit('AdClickThru', [clickThru.url, clickThru.trackID, clickThru.playerHandles])
}
