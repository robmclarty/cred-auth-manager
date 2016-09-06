import { push } from 'react-router-redux'
import {
  STORE_USERS,
  FETCH_USERS_PENDING,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAIL,
  ADD_USER,
  ADD_USER_PENDING,
  ADD_USER_FAIL,
  UPDATE_USER,
  UPDATE_USER_PENDING,
  UPDATE_USER_FAIL,
  REMOVE_USER,
  REMOVE_USER_PENDING,
  REMOVE_USER_FAIL,
  GOTO_USER_PAGE,
  NEXT_USER_PAGE,
  PREV_USER_PAGE,
  SORT_USERS
} from '../constants/ActionTypes'
import { STATUS_SUCCESS, STATUS_ERROR } from '../constants/FlashTypes'
import { showFlash, hideFlash } from './'
import config from '../../config/admin'

const usersUrl = `${ config.authRoot }/users`

// Fetch Users
// -----------
export const fetchUsers = () => (dispatch, callApi) => {
  dispatch(fetchUsersPending())

  return callApi({ url: usersUrl, method: 'GET' })
    .then(res => dispatch(storeUsers(res.users)))
    .then(() => dispatch(gotoUserPage(1)))
    .then(() => dispatch(fetchUsersSuccess()))
    .then(() => dispatch(hideFlash('users')))
    .catch(err => dispatch(fetchUsersFail(err)))
}

const storeUsers = users => ({
  type: STORE_USERS,
  users
})

const fetchUsersPending = () => ({
  type: FETCH_USERS_PENDING
})

const fetchUsersSuccess = users => ({
  type: FETCH_USERS_SUCCESS,
  receivedAt: Date.now()
})

const fetchUsersFail = err => ({
  type: FETCH_USERS_FAIL,
  error: err
})


// Add User
// --------
export const addUser = props => (dispatch, callApi) => {
  dispatch(addUserPending())

  return callApi({
    url: usersUrl,
    method: 'POST',
    body: props
  })
    .then(res => dispatch(addUserSuccess(res.user)))
    .then(() => dispatch(push(`/admin/users`)))
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['User created.']
    })))
    .catch(err => {
      dispatch(addUserFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: err.errors
      }))
    })
}

const addUserPending = () => ({
  type: ADD_USER_PENDING
})

const addUserSuccess = user => ({
  type: ADD_USER,
  user,
  receivedAt: Date.now()
})

const addUserFail = error => ({
  type: ADD_USER_FAIL,
  error
})


// Update User
// -----------
export const updateUser = props => (dispatch, callApi) => {
  const userUrl = `${ usersUrl }/${ props.id }`

  dispatch(updateUserPending())

  return callApi({
    url: userUrl,
    method: 'PUT',
    body: props
  })
    .then(res => dispatch(updateUserSuccess(res.user)))
    .then(() => dispatch(push(`/admin/users`)))
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['User updated.']
    })))
    .catch(err => {
      dispatch(updateUserFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: [err]
      }))
    })
}

const updateUserPending = () => ({
  type: UPDATE_USER_PENDING
})

const updateUserSuccess = user => ({
  type: UPDATE_USER,
  user,
  receivedAt: Date.now()
})

const updateUserFail = error => ({
  type: UPDATE_USER_FAIL,
  error
})


// Remove User
// -----------
export const removeUser = user => (dispatch, callApi) => {
  const userUrl = `${ usersUrl }/${ user.id }`

  dispatch(removeUserPending())

  return callApi({ url: userUrl, method: 'DELETE' })
    .then(res => dispatch(removeUserSuccess(res.user)))
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['User removed.']
    })))
    .catch(err => {
      dispatch(removeUserFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: [err]
      }))
    })
}

const removeUserPending = () => ({
  type: REMOVE_USER_PENDING
})

const removeUserSuccess = user => ({
  type: REMOVE_USER,
  user,
  receivedAt: Date.now()
})

const removeUserFail = error => ({
  type: REMOVE_USER_FAIL,
  error
})


// Pagination
// ----------
export const gotoUserPage = page => ({
  type: GOTO_USER_PAGE,
  page
})

export const nextUserPage = () => ({
  type: NEXT_USER_PAGE
})

export const prevUserPage = () => ({
  type: PREV_USER_PAGE
})

export const sortUsers = by => ({
  type: SORT_USERS,
  by
})
