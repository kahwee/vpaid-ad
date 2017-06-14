const Linear = require('../src/linear')

describe('Linear', function () {
  describe('initializing with no videoSlot or slot', function () {
    let linear
    let slot
    let videoSlot

    before(function () {
      slot = document.createElement('div')
      videoSlot = document.createElement('video')
    })

    after(function () {
      slot = videoSlot = null
    })

    it('should emit AdError when videoSlot is not found', function (done) {
      linear = new Linear()
      linear.subscribe((reason) => {
        done()
      }, 'AdError')
      linear.initAd(320, 160, 'normal', null, null, {slot})
    })

    it('should emit AdError when slot is not found', function (done) {
      linear = new Linear()
      linear.subscribe((reason) => {
        done()
      }, 'AdError')
      linear.initAd(320, 160, 'normal', null, null, {videoSlot})
    })
  })

  describe('misc functions', function () {
    let linear
    let videoSlot
    let slot

    before(function () {
      slot = document.createElement('div')
      videoSlot = document.createElement('video')
      document.body.appendChild(slot)
      document.body.appendChild(videoSlot)
      linear = new Linear()
    })

    after(function () {
      slot.remove()
      videoSlot.remove()
      linear = null
    })

    describe('appendStylesheet()', function () {
      it('should have added style.css', function () {
        linear.appendStylesheet('/base/tests/fixtures/style.css')
        expect(document.querySelectorAll('link[href*="style.css"]')).to.be.length(1)
      })
    })
  })

  describe('with no videos', function () {
    let linear
    let videoSlot
    let slot

    before(function () {
      slot = document.createElement('div')
      videoSlot = document.createElement('video')
      document.body.appendChild(slot)
      document.body.appendChild(videoSlot)
      linear = new Linear()
    })

    after(function () {
      slot.remove()
      videoSlot.remove()
      linear = null
    })

    describe('constructor()', function () {
      it('should be initialized with the right opts', function () {
        expect(linear.opts.videos).to.be.length(0)
      })
    })

    describe('initAd()', function () {
      it('should emit AdLoaded and initialized with the right videoSlot and slot', function (done) {
        linear.subscribe(function (data) {
          expect(linear._slot).to.equal(slot)
          expect(linear._videoSlot).to.equal(videoSlot)
          done()
        }, 'AdLoaded')
        linear.initAd(320, 160, 'normal', null, null, {slot, videoSlot})
      })
    })

    describe('expandAd() and collapseAd()', function () {
      it('should emit AdExpandedChange after expandAd()', function (done) {
        linear.once('AdExpandedChange', function () {
          expect(linear.hasEngaged).to.be.true
          expect(linear.getAdExpanded()).to.be.true
          done()
        })
        linear.expandAd()
      })

      it('should emit AdExpandedChange after collapseAd()', function (done) {
        linear.once('AdExpandedChange', function () {
          expect(linear.hasEngaged).to.be.true
          expect(linear.getAdExpanded()).to.be.false
          done()
        })
        linear.collapseAd()
      })
    })

    describe('emitVpaidMethodInvocations', function () {
      it('should emit getAdWidth() when it is called', function (done) {
        linear.on('getAdWidth()', function () {
          done()
          linear.off('getAdWidth()')
        })
        linear.getAdWidth()
      })
    })

    describe('subscribe() and unsubscribe()', function () {
      it('should emit getAdWidth() when it is called', function (done) {
        let handler = function () {
          linear.unsubscribe(handler, 'Hello')
          done()
        }
        linear.subscribe(handler, 'Hello')
        linear.emit('Hello')
      })

      it('should not cause the previous done() to be called multiple times', function (done) {
        // This is to prove the previous `unsubscribe` did work
        linear.emit('Hello')
        done()
      })
    })

    describe('ad size', function () {
      it('should report the correct width', function (done) {
        expect(linear.getAdWidth()).to.equal(320)
        done()
      })

      it('should report the correct height', function () {
        expect(linear.getAdHeight()).to.equal(160)
      })

      it('should resizeAd with correct parameters', function (done) {
        linear.subscribe(function (data) {
          expect(linear.getAdWidth()).to.equal(640)
          expect(linear.getAdHeight()).to.equal(320)
          done()
          linear.off('AdSizeChange')
        }, 'AdSizeChange')
        linear.resizeAd(640, 320, 'thumbnail')
      })
    })

    describe('handshakeVersion()', function () {
      it('should return with 2.0', function () {
        expect(linear.handshakeVersion()).to.equal('2.0')
        expect(linear.handshakeVersion('whatever')).to.equal('2.0')
      })
    })

    describe('ad volume', function () {
      it('should get the right initialization', function (done) {
        expect(linear.getAdVolume()).to.equal(1)
        done()
      })

      it('should set the right volume', function (done) {
        linear.setAdVolume(0.5)
        expect(linear._attributes.volume).to.equal(0.5)
        done()
      })

      it('should emit AdError is set with invalid volume', function (done) {
        linear.subscribe(function () {
          done()
          linear.off('AdError')
        }, 'AdError')
        linear.setAdVolume(1.5)
      })
    })

    describe('skipAd()', function () {
      it('should not allow skipAd() when adSkippableState is false', function (done) {
        linear._attributes.adSkippableState = false
        expect(linear.skipAd()).to.be.false
        done()
      })

      it('should emit AdSkipped when adSkippableState is true', function (done) {
        linear._attributes.adSkippableState = true
        Promise.all([
          new Promise((resolve) => {
            linear.once('AdSkipped', () => resolve())
          }),
          new Promise((resolve) => {
            linear.once('AdStopped', () => resolve())
          })
        ]).then(() => done())
        linear.skipAd()
      })
    })
  })

  describe('with videos', function () {
    let linear1
    let videoSlot1
    let slot

    before(function () {
      slot = document.createElement('div')
      videoSlot1 = document.createElement('video')
      document.body.appendChild(slot)
      document.body.appendChild(videoSlot1)
      linear1 = new Linear({
        videos: [{
          url: '/base/tests/fixtures/xbox-one.mp4',
          type: 'video/mp4'
        }]
      })
    })

    after(function () {
      slot.remove()
      videoSlot1.remove()
      linear1 = null
    })

    describe('initAd()', function () {
      it('should emit AdLoaded and initialized with right video src', function (done) {
        linear1.subscribe(function (data) {
          expect(linear1._videoSlot.src).to.match(/xbox-one.mp4$/)
          done()
        }, 'AdLoaded')
        linear1.initAd(320, 160, 'normal', null, null, {
          slot,
          videoSlot: videoSlot1
        })
      })
    })

    describe('life cycle', function () {
      this.timeout(5000)
      it('should startAd()', function (done) {
        linear1.subscribe(function () {
          done()
        }, 'AdStarted')
        linear1.startAd()
      })

      it('should emit AdVideoStart when playing', function (done) {
        linear1.subscribe(function () {
          done()
        }, 'AdVideoStart')
        linear1._videoSlot.play()
      })

      it('should return valid AdDuration', function () {
        linear1.hasEngaged = false
        expect(linear1.getAdDuration()).to.be.above(0)
        linear1.hasEngaged = true
        expect(linear1.getAdDuration()).to.be.equal(-2)
      })

      it('should return valid AdRemainingTime', function () {
        linear1.hasEngaged = false
        expect(linear1.getAdRemainingTime()).to.be.above(0)
        linear1.hasEngaged = true
        expect(linear1.getAdRemainingTime()).to.be.equal(-2)
      })

      it('should pauseAd()', function (done) {
        linear1.once('AdPaused', function () {
          done()
        })
        linear1.pauseAd()
      })

      it('should resumeAd()', function (done) {
        linear1.once('AdPlaying', function () {
          done()
        })
        linear1.resumeAd()
      })

      it('should emit AdStopped when stopped', function (done) {
        linear1.once('AdStopped', function () {
          expect(linear1._slot.textContent.trim()).to.be.empty
          done()
        })
        linear1.stopAd()
      })
    })
  })
})
