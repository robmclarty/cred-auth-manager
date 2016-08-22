import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { register, showFlash } from '../../actions';
import { STATUS_SUCCESS } from '../../constants/FlashTypes';
import RegisterForm from '../../components/auth/RegisterForm';
import Page from '../../components/Page'

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
)(RegisterForm);

const RegisterPage = () => (
  <Page name="Create New Account">
    <RegisterContainer />
  </Page>
)

export default RegisterPage;
