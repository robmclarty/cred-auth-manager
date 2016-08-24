import {
  STORE_RESOURCES,
  FETCH_RESOURCES_PENDING,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAIL,
  ADD_RESOURCE_PENDING,
  ADD_RESOURCE_SUCCESS,
  ADD_RESOURCE_FAIL,
  UPDATE_RESOURCE_PENDING,
  UPDATE_RESOURCE_SUCCESS,
  UPDATE_RESOURCE_FAIL,
  REMOVE_RESOURCE_PENDING,
  REMOVE_RESOURCE_SUCCESS,
  REMOVE_RESOURCE_FAIL,
  GOTO_RESOURCE_PAGE,
  NEXT_RESOURCE_PAGE,
  PREV_RESOURCE_PAGE,
  SORT_RESOURCES
} from '../constants/ActionTypes'
import { hideFlash } from './'
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
export const addResource = resource => (dispatch, callApi) => {
  dispatch(addResourcePending());

  return callApi({ url: resourcesUrl, method: 'POST' })
    .then(res => dispatch(addResourceSuccess(res.resource)))
    .catch(err => dispatch(addResourceFail(err)));
}

const addResourcePending = () => ({
  type: ADD_RESOURCE_PENDING
})

const addResourceSuccess = resource => ({
  type: ADD_RESOURCE_SUCCESS,
  resource,
  receivedAt: Date.now()
})

const addResourceFail = error => ({
  type: ADD_RESOURCE_FAIL,
  error
})


// Update Resource
// ---------------
export const updateResource = resource => (dispatch, callApi) => {
  const resourceUrl = `${ resourcesUrl }/${ resource.id }`

  dispatch(updateResourcePending())

  return callApi({ url: resourceUrl, method: 'PUT' })
    .then(res => dispatch(updateResourceSuccess(res.resource)))
    .catch(err => dispatch(updateResourceFail(err)))
}

const updateResourcePending = () => ({
  type: UPDATE_RESOURCE_PENDING
})

const updateResourceSuccess = resource => ({
  type: UPDATE_RESOURCE_SUCCESS,
  resource,
  receivedAt: Date.now()
})

const updateResourceFail = error => ({
  type: UPDATE_RESOURCE_FAIL,
  error
})


// Remove Resource
// ---------------
export const removeResource = resource => (dispatch, callApi) => {
  const resourceUrl = `${ resourcesUrl }/${ resource.id }`

  dispatch(removeResourcePending())

  return callApi({ url: resourceUrl, method: 'DELETE' })
    .then(res => dispatch(removeResourceSuccess(res.resource)))
    .catch(err => dispatch(removeResourceFail(err)))
}

const removeResourcePending = () => ({
  type: REMOVE_RESOURCE_PENDING
})

const removeResourceSuccess = resource => ({
  type: REMOVE_RESOURCE_SUCCESS,
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
