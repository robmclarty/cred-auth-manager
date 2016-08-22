import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { register, showFlash } from '../actions';
import { STATUS_SUCCESS } from '../constants/FlashTypes';
import RegisterFormComponent from '../components/RegisterForm';
import Page from '../components/Page'

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  onSubmit: creds => dispatch(register(creds))
    .then(dispatch(showFlash({
      status: STATUS_SUCCESS,
      messages: ['Registration Complete']
    })))
    .then(dispatch(push(`/admin/login`)))
});

const RegisterForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterFormComponent);

const RegisterPage = () => (
  <Page name="Create New Account">
    <RegisterForm />
  </Page>
)

export default RegisterPage;
