import {
  REGISTER_PENDING,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_PENDING,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_PENDING,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  REFRESH_TOKEN_PENDING,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAIL
} from '../constants/ActionTypes';

const initialState = {
  isFetching: false,
  logoutPending: false,
  isAuthenticated: false,
  tokens: {
    accessToken: '',
    refreshToken: ''
  },
  tokenPayload: {},
  errorMessage: '',
  lastUpdated: Date.now()
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
  case REGISTER_PENDING:
  case LOGIN_PENDING:
    return {
      ...state,
      isFetching: true
    };
  case REGISTER_SUCCESS:
  case LOGIN_SUCCESS:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: true,
      tokens: {
        accessToken: action.accessToken,
        refreshToken: action.refreshToken
      },
      tokenPayload: action.tokenPayload,
      errorMessage: '',
      lastUpdated: action.receivedAt
    };
  case REGISTER_FAIL:
  case LOGIN_FAIL:
    return {
      ...state,
      isFetching: false,
      errorMessage: action.message,
      lastUpdated: action.receivedAt
    };
  case LOGOUT_PENDING:
    return {
      ...state,
      logoutPending: true
    };
  case LOGOUT_SUCCESS:
    return {
      ...state,
      logoutPending: false,
      isFetching: false,
      isAuthenticated: false,
      tokens: {
        accessToken: '',
        refreshToken: ''
      },
      tokenPayload: {},
      lastUpdated: action.receivedAt
    };
  case LOGOUT_FAIL:
    return {
      ...state,
      logoutPending: false,
      lastUpdated: action.receivedAt
    };
  default:
    return state;
  }
};

export default authReducer;
