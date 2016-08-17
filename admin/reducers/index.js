import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import auth from './auth'
import flash from './flash'

const rootReducer = combineReducers({
  auth,
  flash,
  routing: routerReducer
})

export default rootReducer
