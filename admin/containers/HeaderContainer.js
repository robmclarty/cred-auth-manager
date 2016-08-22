import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { logout, changeFilter } from '../actions';
import Header from '../components/Header';

const mapStateToProps = state => ({
  username: state.auth.tokenPayload.username,
  isAuthenticated: state.auth.isAuthenticated,
  currentPath: state.routing.locationBeforeTransitions.pathname
});

const mapDispatchToProps = dispatch => ({
  onClickLogin: () => dispatch(push('/admin/login')),
  onClickLogout: () => dispatch(logout()),
  onClickSignup: () => dispatch(push('/admin/register')),
});

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

export default HeaderContainer;
