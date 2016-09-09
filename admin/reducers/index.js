import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import auth from './auth'
import users from './users'
import resources from './resources'
import flash from './flash'

const appReducer = combineReducers({
  auth,
  users,
  resources,
  flash,
  routing: routerReducer
})

const rootReducer = (state, action) => {
  //console.log('action: ', action)
  //if (action.type === 'LOGOUT_SUCCESS') state = undefined

  return appReducer(state, action)
}

export default rootReducer
