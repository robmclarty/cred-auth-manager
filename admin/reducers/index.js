import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import auth from './auth'
import users from './users'
import flash from './flash'

const rootReducer = combineReducers({
  auth,
  users,
  flash,
  routing: routerReducer
})

export default rootReducer
