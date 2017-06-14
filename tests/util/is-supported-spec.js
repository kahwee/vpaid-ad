/* eslint no-unused-expressions: "off" */
const isSupported = require('../../src/util/is-supported')

describe('util.isSupported', function () {
  it('should work for positive case', function () {
    expect(isSupported('video/mp4')).to.be.true
  })
  it('should work for negative case', function () {
    expect(isSupported('video/x-mp4')).to.be.false
  })
})
