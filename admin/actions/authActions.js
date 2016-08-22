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
  STATUS_SUCCESS
} from '../constants/FlashTypes';
import {
  updateLocalTokens,
  removeLocalTokens,
  freshTokens,
  decodedPayload
} from '../middleware/jwt-api';
import {
  showFlash,
  hideFlash,
  fetchRelationships,
  fetchProfile
} from './';

const tokensUrl = `${ config.authRoot }/tokens`;

const startup = (dispatch, state) => {
  const userId = state.auth.tokenPayload.userId

  return Promise.resolve()
    .then(dispatch(showFlash({
      status: STATUS_PENDING,
      messages: ['Loading resources...']
    })))
    //.then(dispatch(fetchUsers()))
    .then(dispatch(hideFlash()))
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
    .then(user => {
      console.log('registered user: ', user)

    })
    .catch(err => dispatch(registerFail(err)))
}

export const registerPending = () => ({
  type: REGISTER_PENDING
})

export const registerSuccess = () => ({
  type: registerSuccess,
  accessToken,
  refreshToken,
  tokenPayload: decodedPayload(accessToken),
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
    .then(updateLocalTokens)
    .then(tokens => dispatch(loginSuccess(tokens)))
    .then(() => startup(dispatch, getState()))
    .catch(err => dispatch(loginFail(err)))
};

// TODO: Might want to handle auto-login failure differently than regular
// failure so that there isn't an actual error message displayed necessarily.
export const autoLogin = () => (dispatch, callApi, getState) => {
  dispatch(loginPending());

  return freshTokens(getState())
    .then(updateLocalTokens)
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
    tokenPayload: decodedPayload(accessToken),
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

  return callApi({ url: tokensUrl, method: 'DELETE', useRefreshToken: true })
    .then(removeLocalTokens)
    .then(dispatch(logoutSuccess()))
    .then(dispatch(push('/admin')))
    .catch(err => dispatch(logoutFail(err)));
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
