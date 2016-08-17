// JWT API Redux Middleware
//
// This modules makes a lot of assumptions and is meant to make interaction with
// a specific kind of API very easy. The main feature is to handle any action
// which returns a function (exactly like redux-thunk) and offer some specific
// parameters which that function may use to handle async actions. Namely,
//
// 1. the Redux `dispatch` function
// 2. a custom `callApi` function
// 3. the Redux `getState` function
//
// With these properties, the function returned by the action may easily
// dispatch multiple lifecycle actions while handling async interaction with an
// API using promises.
//
// The following assumptions are made about the structure and use of this app
// with a certain kind of backend API:
//
// - auth is done using JWTs as a bearer token in the Authorization header
// - two tokens will be stored in an object `store.auth.tokens`
// - the tokens are named `accessToken` and `refreshToken`
// - accessTokens can be refreshed by PUTing the refresh token to `/tokens`
// - all API calls use JSON (both sending and receiving data)
// - API responses include a `success` property which is boolean
// - API responses include a `message` property with a brief description
//
// The custom `callApi` function takes a number of optional parameters which
// tell it what to do:
//
// - @url : '' - a full URL pointing to the API endpoint of interest
// - @method : 'GET' - the HTTP verb to be used in the request
// - @body : null - optional JSON object used to send data
// - @requireAuth : true - determines if Authorization header should be used
// - @useRefreshToken : false - determines if refreshToken should be used (by
//   default, the accessToken is used in Authorization header for all requests)
//
// The `dispatch` and `getState` parameters are simply passed from Redux as
// a convenience.

import fetch from 'node-fetch';
import localforage from 'localforage';
import config from '../../config/admin';

// Prefer localstorage before trying bulkier solutions.
localforage.config({
  name: config.appName,
  driver: [
    localforage.LOCALSTORAGE,
    localforage.INDEXEDDB,
    localforage.WEBSQL
  ]
});

// Authentication route.
const tokensUrl = `${ config.authRoot }/tokens`;

const tokenExpirationWindow = 60 * 10; // 10min in seconds

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Make the actual fetch() call. Reject if there's an error, otherwise resolve
// with the parsed JSON body.
const request = (url, options) => fetch(url, options)
  .then(res => Promise.all([res, res.json()]))
  .then(responses => {
    const res = responses[0]
    const json = responses[1]

    if (!res.ok) throw json.message
    return Promise.resolve(json)
  })
  .catch(err => {
    console.log('Error: ', err);
    return Promise.reject(err)
  })

// Decode base64 token and return the 2nd part (separated by '.') which is the
// JWT payload object.
export const decodedPayload = token => {
  return JSON.parse(atob(token.split('.')[1]));
};

// Return true if the token's `exp` attribute is less than the current time
// plus 10 minutes (enough time to use the token successfully).
const withinExpirationWindow = payload => {
  const nowInSeconds = Date.now() / 1000;

  return payload.exp <= nowInSeconds + tokenExpirationWindow;
};

export const tokenIsExpired = token => {
  return withinExpirationWindow(decodedPayload(token));
};

// Store tokens in local-storage and return the tokens on success, otherwise
// return a rejected promise. To be used with the login fetch-promise block.
export const updateLocalTokens = tokens => {
  const { accessToken, refreshToken } = tokens;
  const promises = [
    localforage.setItem('accessToken', accessToken),
    localforage.setItem('refreshToken', refreshToken)
  ];

  return Promise.all(promises).then(() => tokens);
};

// Delete tokens from local storage.
export const removeLocalTokens = () => {
  const promises = [
    localforage.removeItem('accessToken'),
    localforage.removeItem('refreshToken')
  ];

  return Promise.all(promises);
};

// Return tokens from local stroage.
export const getLocalTokens = () => {
  const promises = [
    localforage.getItem('accessToken'),
    localforage.getItem('refreshToken')
  ];

  return Promise.all(promises).then((tokens) => {
    const accessToken = tokens[0];
    const refreshToken = tokens[1];

    if (!accessToken || !refreshToken) {
      return Promise.reject('Problem retrieving tokens from local storage.');
    }

    return Promise.resolve({ accessToken, refreshToken });
  });
};

// If tokens already exist from the Redux state, use those; otherwise try to
// get them from local storage.
const getTokens = tokens => {
  return tokens.accessToken && tokens.refreshToken ?
    Promise.resolve(tokens) :
    getLocalTokens();
};

// Get fresh access token using a currently valid refresh token.
// Append the refreshToken to the json response so that it is formatted such
// that parseTokenResponse() can parse it.
export const refreshTokensIfExpired = tokens => {
  let { accessToken, refreshToken } = tokens;

  // If access-token isn't expired, just return it.
  if (!tokenIsExpired(accessToken)) {
    return Promise.resolve({ accessToken, refreshToken });
  }

  const options = {
    method: 'PUT',
    headers: {
      ...jsonHeaders,
      'Authorization': `Bearer ${ refreshToken }`
    }
  };

  return request(tokensUrl, options)
    .then(res => res.json())
    .then(json => Promise.resolve({ accessToken: json.accessToken, refreshToken }))
    .catch(err => Promise.reject(`Problem refreshing access-token: ${ err }`));
};

// Return the current tokens from either the Redux store, or local storage.
// If they have expired, return refreshed versions, or an error (can no longer
// refresh them).
export const freshTokens = state => {
  return getTokens(state.auth.tokens)
    .then(refreshTokensIfExpired)
    .then(tokens => Promise.resolve(tokens))
    .catch(err => Promise.reject(err));
}

// Return options with Authorization header appeneded.
const optionsWithAuth = (options, bearerToken) => {
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${ bearerToken }`
    }
  };
};

// Use the fetch() command to initiate an AJAX request and return a promise.
// Grab the access-token from the Redux store using getState() and refresh it
// if it is expired (and return an error if it can't be refreshed).
const callApi = state => {
  return ({
    url = '',
    method = 'GET',
    requireAuth = true,
    body = {},
    useRefreshToken = false
  }) => {
    const options = {
      method,
      headers: jsonHeaders
    };

    // Append body as JSON, if it is defined.
    if (body) options.body = JSON.stringify(body);

    // If requireAuth is false, return the request immediately.
    if (!requireAuth) return request(url, options);

    // Otherwise, add the authorization header with the JWT and make an
    // authorized request with fresh tokens.
    return freshTokens(state)
      .then(tokens => useRefreshToken ? tokens.refreshToken : tokens.accessToken)
      .then(bearerToken => request(url, optionsWithAuth(options, bearerToken)));
  };
};

// Wrap the fetch() command with functionality that checks the current token,
// and if it is expired, tries to refresh it before attempting the API call.
// This assumes an implementation of JWTs on the auth server which uses both
// an access-token and a refresh-token.
const jwtApiMiddleware = ({ dispatch, getState }) => next => action => {
  return typeof action === 'function' ?
    action(dispatch, callApi(getState()), getState) :
    next(action);
};

export default jwtApiMiddleware;
