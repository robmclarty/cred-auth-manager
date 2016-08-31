import {
  ADD_USER,
  UPDATE_USER,
  REMOVE_USER,
  STORE_USERS,
  FETCH_USERS_PENDING,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAIL,
  GOTO_USER_PAGE,
  NEXT_USER_PAGE,
  PREV_USER_PAGE,
  SORT_USERS,
  FILTER_USERS
} from '../constants/ActionTypes'
import paginated from 'paginated-redux'
import fetchable from '../transducers/fetchable'

const users = (state = [], action) => {
  switch (action.type) {
  case STORE_USERS:
    return action.users
  case ADD_USER:
    return [...state, action.user]
  case UPDATE_USER: {
    const index = state.findIndex(user => (user.id === action.user.id))

    return [
      ...state.slice(0, index),
      action.user,
      ...state.slice(index + 1)
    ]
  }
  case REMOVE_USER:
    return state.filter(user => (user.id !== action.id))
  default:
    return state
  }
}

const paginatedUsers = paginated(users, {
  GOTO_PAGE: GOTO_USER_PAGE,
  NEXT_PAGE: NEXT_USER_PAGE,
  PREV_PAGE: PREV_USER_PAGE,
  FILTER: FILTER_USERS,
  SORT: SORT_USERS
})

const fetchableUsers = fetchable(paginatedUsers, {
  FETCH_PENDING: FETCH_USERS_PENDING,
  FETCH_SUCCESS: FETCH_USERS_SUCCESS,
  FETCH_FAIL: FETCH_USERS_FAIL
})

export default fetchableUsers
