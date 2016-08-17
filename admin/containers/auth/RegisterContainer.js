import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { register, showFlash } from '../actions';
import { STATUS_SUCCESS } from '../constants/FlashTypes';

import Register from '../components/Register';

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  onSubmit: creds => dispatch(register(creds))
    .then(dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['Registration Complete']
    })))
    .then(dispatch(push(`/rebelchat/login`)))
});

const RegisterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);

export default RegisterContainer;
