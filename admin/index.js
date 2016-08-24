import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerMiddleware, push } from 'react-router-redux'
// TODO: switch this to cred-redux
import jwtApi from './middleware/jwt-api'
import appReducer from './reducers'
import { autoLogin, resetFlash } from './actions'

// Containers
import requireAuth from './helpers/requireAuth'
import App from './containers/App'
import DashboardPage from './containers/DashboardPage'
import LoginPage from './containers/LoginPage'
import LogoutPage from './containers/LogoutPage'
import RegisterPage from './containers/RegisterPage'
import NotFoundPage from './containers/NotFoundPage'
import UserListPage from './containers/UserListPage'
import ResourceListPage from './containers/ResourceListPage'

// Detect and use chrome redux extension if available.
const devTools = window.devToolsExtension ?
  window.devToolsExtension() :
  f => f

// Setup custom middleware (esp. JWT API calls, and react-router redux store).
const middlewares = compose(
  applyMiddleware(
    jwtApi, // TODO: switch this to cred-redux
    routerMiddleware(browserHistory)
  ),
  devTools
)

// Create store from app's reducers combined with react-router's routerReducer.
const store = createStore(appReducer, middlewares)

// Hook up react-router history to redux store.
const history = syncHistoryWithStore(browserHistory, store)

// Try to login from tokens in localstorage.
store.dispatch(autoLogin()) // TODO: switch this to cred-redux

const resetFlashOnEnter = () => store.dispatch(resetFlash())

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/admin" component={App}>
        <IndexRoute component={DashboardPage} />
        <Route path="/admin" component={DashboardPage} />
        <Route path="/admin/login" component={LoginPage} />
        <Route path="/admin/logout" component={LogoutPage} />
        <Route path="/admin/register" component={RegisterPage} />
        <Route path="/admin/users" component={requireAuth(UserListPage)} />
        <Route path="/admin/resources" component={requireAuth(ResourceListPage)} />
        <Route path="/admin/*" component={NotFoundPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('cred-auth-manager')
)
