import { push } from 'react-router-redux'
import {
  STORE_RESOURCES,
  FETCH_RESOURCES_PENDING,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAIL,
  ADD_RESOURCE,
  ADD_RESOURCE_PENDING,
  ADD_RESOURCE_FAIL,
  UPDATE_RESOURCE,
  UPDATE_RESOURCE_PENDING,
  UPDATE_RESOURCE_FAIL,
  REMOVE_RESOURCE,
  REMOVE_RESOURCE_PENDING,
  REMOVE_RESOURCE_FAIL,
  GOTO_RESOURCE_PAGE,
  NEXT_RESOURCE_PAGE,
  PREV_RESOURCE_PAGE,
  SORT_RESOURCES
} from '../constants/ActionTypes'
import { STATUS_SUCCESS, STATUS_ERROR } from '../constants/FlashTypes'
import { showFlash, hideFlash } from './'
import config from '../../config/admin'

const resourcesUrl = `${ config.authRoot }/resources`

// Fetch Resources
// ---------------
export const fetchResources = () => (dispatch, callApi) => {
  dispatch(fetchResourcesPending())

  return callApi({ url: resourcesUrl, method: 'GET' })
    .then(res => dispatch(storeResources(res.resources)))
    .then(() => dispatch(gotoResourcePage(1)))
    .then(() => dispatch(fetchResourcesSuccess()))
    .then(() => dispatch(hideFlash('resources')))
    .catch(err => dispatch(fetchResourcesFail(err)))
}

const storeResources = resources => ({
  type: STORE_RESOURCES,
  resources
})

const fetchResourcesPending = () => ({
  type: FETCH_RESOURCES_PENDING
})

const fetchResourcesSuccess = resources => ({
  type: FETCH_RESOURCES_SUCCESS,
  receivedAt: Date.now()
})

const fetchResourcesFail = err => ({
  type: FETCH_RESOURCES_FAIL,
  error: err
})


// Add Resource
// ------------
export const addResource = props => (dispatch, callApi) => {
  dispatch(addResourcePending());

  return callApi({
    url: resourcesUrl,
    method: 'POST',
    body: props
  })
    .then(res => dispatch(addResourceSuccess(res.resource)))
    .then(() => dispatch(push(`/admin/resources`)))
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['Resource created.']
    })))
    .catch(res => {
      dispatch(addResourceFail(res))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: res.errors || res
      }))
    })
}

const addResourcePending = () => ({
  type: ADD_RESOURCE_PENDING
})

const addResourceSuccess = resource => ({
  type: ADD_RESOURCE,
  resource,
  receivedAt: Date.now()
})

const addResourceFail = error => ({
  type: ADD_RESOURCE_FAIL,
  error
})


// Update Resource
// ---------------
export const updateResource = props => (dispatch, callApi) => {
  const resourceUrl = `${ resourcesUrl }/${ props.id }`

  dispatch(updateResourcePending())

  return callApi({
    url: resourceUrl,
    method: 'PUT',
    body: props
  })
    .then(res => dispatch(updateResourceSuccess(res.resource)))
    .then(() => dispatch(push(`/admin/resources`)))
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['Resource updated.']
    })))
    .catch(err => {
      dispatch(updateResourceFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: [err]
      }))
    })
}

const updateResourcePending = () => ({
  type: UPDATE_RESOURCE_PENDING
})

const updateResourceSuccess = resource => ({
  type: UPDATE_RESOURCE,
  resource,
  receivedAt: Date.now()
})

const updateResourceFail = error => ({
  type: UPDATE_RESOURCE_FAIL,
  error
})


// Remove Resource
// ---------------
export const removeResource = id => (dispatch, callApi) => {
  const resourceUrl = `${ resourcesUrl }/${ id }`

  dispatch(removeResourcePending())

  return callApi({ url: resourceUrl, method: 'DELETE' })
    .then(res => dispatch(removeResourceSuccess(res.resource)))
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['Resource removed.']
    })))
    .catch(err => {
      dispatch(removeResourceFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: [err]
      }))
    })
}

const removeResourcePending = () => ({
  type: REMOVE_RESOURCE_PENDING
})

const removeResourceSuccess = resource => ({
  type: REMOVE_RESOURCE,
  resource,
  receivedAt: Date.now()
})

const removeResourceFail = error => ({
  type: REMOVE_RESOURCE_FAIL,
  error
})


// Paginate Resources
// ------------------
export const gotoResourcePage = page => ({
  type: GOTO_RESOURCE_PAGE,
  page
})

export const nextResourcePage = () => ({
  type: NEXT_RESOURCE_PAGE
})

export const prevResourcePage = () => ({
  type: PREV_RESOURCE_PAGE
})

export const sortResources = by => ({
  type: SORT_RESOURCES,
  by
})
