import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { login } from '../actions';
import LoginFormComponent from '../components/LoginForm';
import Page from '../components/Page'

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  onSubmit: creds => dispatch(login(creds))
});

const LoginForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginFormComponent);

const LoginPage = () => (
  <Page name="Login">
    <LoginForm />
  </Page>
)

export default LoginPage;
