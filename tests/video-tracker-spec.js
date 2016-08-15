const VideoTracker = require('../src/video-tracker').default
const TinyEmitter = require('tiny-emitter')

describe.only('VideoTracker', function () {
  describe('with videos', function () {
    this.wait = 10000
    let videoSlot1
    let videoSlot2
    let tracker1
    let tracker2
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
      document.body.appendChild(videoSlot1)
      document.body.appendChild(videoSlot2)
    })

    after(function () {
      videoSlot1.remove()
      videoSlot2.remove()
      emitter1 = emitter2 = null
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
        emitter2.on('AdVideoFirstQuartile', function () {
          done()
        })
        videoSlot2.play()
      })

      it('should emit "AdVideoThirdQuartile"', function (done) {
        emitter2.on('AdVideoThirdQuartile', function () {
          done()
        })
      })
    })
  })
})
