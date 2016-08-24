import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import auth from './auth'
import users from './users'
import resources from './resources'
import flash from './flash'

const rootReducer = combineReducers({
  auth,
  users,
  resources,
  flash,
  routing: routerReducer
})

export default rootReducer
