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
import requireAuth from './containers/AuthenticatedContainer'
import App from './containers/AppContainer'
import Login from './containers/auth/LoginContainer'
import Register from './containers/auth/RegisterContainer'
import NotFound from './components/NotFound'

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
store.dispatch(autoLogin())

const resetFlashOnEnter = () => store.dispatch(resetFlash())

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/admin" component={App}>
        <IndexRoute component={Login} />
        <Route path="/admin/login" component={Login} onEnter={resetFlashOnEnter} />
        <Route path="/admin/register" component={Register} onEnter={resetFlashOnEnter} />
        <Route path="/admin/*" component={NotFound} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('cred-auth-manager')
)
