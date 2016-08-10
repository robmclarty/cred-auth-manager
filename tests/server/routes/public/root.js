'use strict'

describe('GET /', () => {
  it('loads correctly', () => {
    return request.get('/')
      .expect(200)
      .then(res => {
        expect(res).not.to.be.null
      })
  })
})
