import { push } from 'react-router-redux';
import config from '../../config/admin';
import {
  REGISTER_PENDING,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_PENDING,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_PENDING,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL
} from '../constants/ActionTypes';
import {
  STATUS_PENDING,
  STATUS_SUCCESS,
  STATUS_ERROR
} from '../constants/FlashTypes';
import {
  updateTokens,
  destroyTokens,
  freshTokens,
  decodePayload
} from '../middleware/jwt-api';
import {
  showFlash,
  showFlashLoading,
  hideFlash,
  fetchUsers,
  fetchResources
} from './';

const tokensUrl = `${ config.authRoot }/tokens`;

// Common actions to take to initialize the app's state.
const startup = (dispatch, state) => {
  const userId = state.auth.tokenPayload.userId

  dispatch(showFlashLoading({ pendingResources: ['users', 'resources'] }))
  dispatch(fetchUsers())
  dispatch(fetchResources())
};


// Register
// --------
export const register = creds => (dispatch, callApi) => {
  dispatch(registerPending())

  return callApi({
    url: `${ config.authRoot }/registration`,
    method: 'POST',
    body: creds,
    requireAuth: false
  })
    .then(json => json.user)
    .then(user => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: `Registred as ${ user.username }.`
    })))
    .catch(err => {
      dispatch(registerFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: err.message
      }))
    })
}

export const registerPending = () => ({
  type: REGISTER_PENDING
})

export const registerSuccess = () => ({
  type: registerSuccess,
  accessToken,
  refreshToken,
  tokenPayload: decodePayload(accessToken),
  receivedAt: Date.now()
})

export const registerFail = err => ({
  type: REGISTER_FAIL,
  message: err,
  receivedAt: Date.now()
})


// Login
// -----

// Post login credentials to server and receive JSON Web Tokens for
// authorization with API. Redirect to map screen after successful manual login.
//
// `creds` is an object containing a user's login credentials:
// {
//   username: 'johndoe',
//   password: 'my-s3cret_Password'
// }
export const login = creds => (dispatch, callApi, getState) => {
  dispatch(loginPending())

  return callApi({
    url: tokensUrl,
    method: 'POST',
    body: creds,
    requireAuth: false
  })
    .then(json => json.tokens)
    .then(updateTokens)
    .then(tokens => dispatch(loginSuccess(tokens)))
    .then(() => startup(dispatch, getState()))
    .then(() => dispatch(push(`/admin`))) // TODO: try NOT having `push` in the action creator
    .catch(err => {
      dispatch(loginFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: err.message
      }))
    })
};

// TODO: Might want to handle auto-login failure differently than regular
// failure so that there isn't an actual error message displayed necessarily.
export const autoLogin = () => (dispatch, callApi, getState) => {
  dispatch(loginPending());

  return freshTokens(getState())
    .then(updateTokens)
    .then(tokens => dispatch(loginSuccess(tokens)))
    .then(() => startup(dispatch, getState()))
    .catch(err => dispatch(loginFail(err)))
};

const loginPending = () => ({
  type: LOGIN_PENDING
});

const loginSuccess = tokens => {
  const { accessToken, refreshToken } = tokens

  return {
    type: LOGIN_SUCCESS,
    accessToken,
    refreshToken,
    tokenPayload: decodePayload(accessToken),
    receivedAt: Date.now()
  };
};

const loginFail = err => ({
  type: LOGIN_FAIL,
  message: err,
  receivedAt: Date.now()
});


// Logout
// ------
export const logout = () => (dispatch, callApi) => {
  dispatch(logoutPending());

  // Immediately remove tokens from local storage and initiate logout action so
  // that the tokens are removed from local storage regardless of what happens
  // on the server (e.g., maybe the server's token cache was reset but the local
  // storage is still active).
  return destroyTokens()
    .then(() => dispatch(logoutSuccess()))
    .then(() => dispatch(push('/admin'))) // TODO: try NOT having `push` in the action creator
    .then(() => dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['You are now logged out.']
    })))
    .then(() => callApi({ url: tokensUrl, method: 'DELETE', useRefreshToken: true }))
    .catch(err => {
      dispatch(logoutFail(err))
      dispatch(showFlash({
        status: STATUS_ERROR,
        messages: err.message
      }))
    })
};

const logoutPending = () => ({
  type: LOGOUT_PENDING
});

const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS,
  receivedAt: Date.now()
});

const logoutFail = err => ({
  type: LOGOUT_FAIL,
  message: err,
  receivedAt: Date.now()
});
