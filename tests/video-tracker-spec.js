const VideoTracker = require('../src/video-tracker')
const TinyEmitter = require('tiny-emitter')

describe('VideoTracker', function () {
  describe('with videos', function () {
    this.timeout(10000)
    let videoSlot1
    let videoSlot2
    let tracker1 // eslint-disable-line no-unused-vars
    let tracker2 // eslint-disable-line no-unused-vars
    let emitter1
    let emitter2

    before(function () {
      videoSlot1 = document.createElement('video')
      emitter1 = new TinyEmitter()
      tracker1 = new VideoTracker(videoSlot1, emitter1, '')
      videoSlot2 = document.createElement('video')
      emitter2 = new TinyEmitter()
      tracker2 = new VideoTracker(videoSlot2, emitter2, 'AdVideo')
      videoSlot1.src = '/base/tests/fixtures/xbox-one.mp4'
      videoSlot2.src = '/base/tests/fixtures/xbox-one.mp4'
      videoSlot1.volume = videoSlot2.volume = 0
      videoSlot1.muted = videoSlot2.muted = true
      document.body.appendChild(videoSlot1)
      document.body.appendChild(videoSlot2)
    })

    after(function () {
      videoSlot1.remove()
      videoSlot2.remove()
      emitter1 = emitter2 = null
      tracker1 = tracker2 = null
    })

    describe('life cycle #1 (for staggering)', function () {
      it('should emit "Start"', function (done) {
        emitter1.on('Start', function () {
          done()
        })
        videoSlot1.play()
      })

      it('should emit "Midpoint"', function (done) {
        emitter1.on('Midpoint', function () {
          done()
        })
      })

      it('should emit "Complete"', function (done) {
        emitter1.on('Complete', function () {
          done()
        })
      })
    })

    describe('life cycle #2 (for staggering)', function () {
      it('should emit "AdVideoFirstQuartile"', function (done) {
        emitter2.once('AdVideoFirstQuartile', function () {
          done()
        })
        videoSlot2.play()
      })

      it('should emit "AdVideoThirdQuartile"', function (done) {
        emitter2.once('AdVideoThirdQuartile', function () {
          done()
        })
      })
    })
  })
})
