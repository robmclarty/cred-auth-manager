'use strict'

// Tokens
// ------
const login = (username, password) => request.post('/tokens')
  .set('Accept', 'application/json')
  .send({ username, password })
  .expect('Content-Type', /json/)
  .expect(200)
  .then(res => res.body.tokens)

const postTokens = credentials => request.post('/tokens')
  .set('Accept', 'application/json')
  .send(credentials)
  .expect('Content-Type', /json/)

// Refresh tokens can be revoked in one of two ways:
// 1. revoke your own token (i.e., the token passed in the Auth header)
// 2. revoke someone else's token (in this case `optionalRefreshToken`)
const deleteTokens = refreshToken => request.delete('/tokens')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${ refreshToken }`)
    .expect('Content-Type', /json/)

const deleteTokensTargeted = (refreshToken, targetRefreshToken) => request.delete('/tokens')
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ refreshToken }`)
  .send({ token: targetRefreshToken })
  .expect('Content-Type', /json/)

const putTokens = refreshToken => request.put('/tokens')
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ refreshToken }`)
  .expect('Content-Type', /json/)


// Users
// -----
const getUsers = token => request.get('/users')
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

const postUsers = (token, props) => request.post(`/users`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send(props)
  .expect('Content-Type', /json/)

const getUser = (token, userId) => request.get(`/users/${ userId }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

const putUser = (token, userId, props) => request.put(`/users/${ userId }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send(props)
  .expect('Content-Type', /json/)

const deleteUser = (token, userId) => request.delete(`/users/${ userId }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

module.exports = {
  login,
  postTokens,
  putTokens,
  deleteTokens,
  deleteTokensTargeted,
  getUsers,
  postUsers,
  getUser,
  putUser,
  deleteUser
}
