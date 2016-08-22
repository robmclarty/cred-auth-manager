import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { login } from '../../actions';
import LoginForm from '../../components/auth/LoginForm';
import Page from '../../components/Page'

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  onSubmit: creds => dispatch(login(creds)).then(dispatch(push(`/rebelchat/chat`)))
});

const LoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginForm);

const LoginPage = () => (
  <Page name="Login">
    <LoginContainer />
  </Page>
)

export default LoginPage;
