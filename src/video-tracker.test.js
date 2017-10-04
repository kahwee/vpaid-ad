const VideoTracker = require('../src/video-tracker')
const TinyEmitter = require('tiny-emitter')

describe('VideoTracker', function () {
  describe('with videos', function () {
    let videoSlot1
    let videoSlot2
    let tracker1 // eslint-disable-line no-unused-vars
    let tracker2 // eslint-disable-line no-unused-vars
    let emitter1
    let emitter2

    beforeEach(function () {
      videoSlot1 = document.createElement('video')
      emitter1 = new TinyEmitter()
      tracker1 = new VideoTracker(videoSlot1, emitter1, '')
      videoSlot2 = document.createElement('video')
      emitter2 = new TinyEmitter()
      tracker2 = new VideoTracker(videoSlot2, emitter2, 'AdVideo')
      videoSlot1.src = 'https://cdn.rawgit.com/kahwee/vpaid-ad/ef31ba24/tests/fixtures/xbox-one.mp4'
      videoSlot2.src = 'https://github.com/kahwee/vpaid-ad/blob/master/tests/fixtures/xbox-one.mp4?raw=true'
      document.body.appendChild(videoSlot1)
      document.body.appendChild(videoSlot2)
    })

    afterEach(function () {
      videoSlot1.remove()
      videoSlot2.remove()
      emitter1 = emitter2 = null
      tracker1 = tracker2 = null
    })

    describe('life cycle #1 (for staggering)', function () {
      it('should emit "Start"', function () {
        console.log('hi')
        return new Promise((resolve, reject) => {
          emitter1.on('Start', function () {
            console.log('2')
            resolve()
          })
          videoSlot1.play()
          console.log('blah')
        })
      })

      // it('should emit "Midpoint"', function (done) {
      //   emitter1.on('Midpoint', function () {
      //     done()
      //   })
      // })

      // it('should emit "Complete"', function (done) {
      //   emitter1.on('Complete', function () {
      //     done()
      //   })
      // })
    })

    // describe('life cycle #2 (for staggering)', function () {
    //   it('should emit "AdVideoFirstQuartile"', function (done) {
    //     emitter2.once('AdVideoFirstQuartile', function () {
    //       done()
    //     })
    //     videoSlot2.play()
    //   })

    //   it('should emit "AdVideoThirdQuartile"', function (done) {
    //     emitter2.once('AdVideoThirdQuartile', function () {
    //       done()
    //     })
    //   })
    // })
  })
})
