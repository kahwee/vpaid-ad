import setSize from './set-size'
const size = [12, 14]
let div
beforeEach(() => {
  div = document.createElement('div')
})

afterEach(() => {
  div.remove()
})
test('check setSize using style', () => {
  setSize(div, size)
  expect(div.style.width).toBe(`${size[0]}px`)
  expect(div.style.height).toBe(`${size[1]}px`)
})

test('check setSize using attributes', () => {
  setSize(div, size)
  expect(div.width).toBe(size[0])
  expect(div.height).toBe(size[1])
})
