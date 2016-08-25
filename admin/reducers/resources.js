import {
  ADD_RESOURCE,
  UPDATE_RESOURCE,
  REMOVE_RESOURCE,
  STORE_RESOURCES,
  FETCH_RESOURCES_PENDING,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAIL,
  GOTO_RESOURCE_PAGE,
  NEXT_RESOURCE_PAGE,
  PREV_RESOURCE_PAGE,
  SORT_RESOURCES,
  FILTER_RESOURCES
} from '../constants/ActionTypes'
import paginated from 'paginated-redux'
import fetchable from '../transducers/fetchable'

const resources = (state = [], action) => {
  switch (action.type) {
  case STORE_RESOURCES:
    return action.resources
  case ADD_RESOURCE:
    return [...state, action.resource]
  case UPDATE_RESOURCE:
    const index = state.findIndex(resource => (resource.id === action.resource.id))

    return [
      ...state.slice(0, index),
      action.resource,
      ...state.slice(index + 1)
    ]
  case REMOVE_RESOURCE:
    return state.filter(resource => (resource.id !== action.id))
  default:
    return state
  }
}

const paginatedResources = paginated(resources, {
  GOTO_PAGE: GOTO_RESOURCE_PAGE,
  NEXT_PAGE: NEXT_RESOURCE_PAGE,
  PREV_PAGE: PREV_RESOURCE_PAGE,
  FILTER: FILTER_RESOURCES,
  SORT: SORT_RESOURCES
})

const fetchableResources = fetchable(paginatedResources, {
  FETCH_PENDING: FETCH_RESOURCES_PENDING,
  FETCH_SUCCESS: FETCH_RESOURCES_SUCCESS,
  FETCH_FAIL: FETCH_RESOURCES_FAIL
})

export default fetchableResources
