const setSize = require('../../src/util/set-size')

describe('util.setSize', function () {
  let div
  before(function () {
    div = document.createElement('div')
  })
  it('should assign px at the back', function () {
    setSize(div, [1, 2])
    expect(div.style.width).to.equal('1px')
    expect(div.style.height).to.equal('2px')
  })
  it('should assign attr width and height', function () {
    setSize(div, [3, 4])
    expect(div.width).to.equal(3)
    expect(div.height).to.equal(4)
  })
})
