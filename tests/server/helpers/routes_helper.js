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
const deleteTokens = refreshToken => request.delete('/tokens')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${ refreshToken }`)
    .expect('Content-Type', /json/)

// 2. revoke someone else's token (in this case `optionalRefreshToken`)
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

const getUser = (token, id) => request.get(`/users/${ id }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

const putUser = (token, id, props) => request.put(`/users/${ id }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send(props)
  .expect('Content-Type', /json/)

const deleteUser = (token, id) => request.delete(`/users/${ id }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)


// Permissions
// -----------
const getPermissions = (token, id, resourceName) =>
  request.get(`/users/${ id }/permissions/${ resourceName }`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${ token }`)
    .expect('Content-Type', /json/)

const postPermissions = (token, id, resourceName, perms) =>
  request.post(`/users/${ id }/permissions/${ resourceName }`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${ token }`)
    .send({ actions: perms })
    .expect('Content-Type', /json/)

const deletePermissions = (token, id, resourceName, perms) =>
  request.delete(`/users/${ id }/permissions/${ resourceName }`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${ token }`)
    .send(perms)
    .expect('Content-Type', /json/)


// Resources
// ---------
const getResources = token => request.get('/resources')
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

const postResources = (token, props) => request.post('/resources')
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send(props)
  .expect('Content-Type', /json/)

const getResource = (token, id) => request.get(`/resources/${ id }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

const putResource = (token, id, props) => request.put(`/resources/${ id }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send(props)
  .expect('Content-Type', /json/)

const deleteResource = (token, id) => request.delete(`/resources/${ id }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)


// Resource Actions
// ----------------
const getResourceActions = (token, id) => request.get(`/resources/${ id }/actions`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

const postResourceActions = (token, id, actions) => request.put(`/resources/${ id }/actions`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send({ actions })
  .expect('Content-Type', /json/)

const deleteResourceActions = (token, id, actions) => request.delete(`/resources/${ id }/actions`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .send({ actions })
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
  deleteUser,
  getPermissions,
  postPermissions,
  deletePermissions,
  getResources,
  postResources,
  getResource,
  putResource,
  deleteResource,
  getResourceActions,
  postResourceActions,
  deleteResourceActions
}
