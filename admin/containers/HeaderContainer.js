import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { logout, changeFilter } from '../actions';
import Header from '../components/Header';

// TODO: implement some sort of queue + throttle so that changeFilter is only
// called every so often (but queued up so at least the last change is called).
// Like, have a queue of 1 element. If that element is currently empty,
// call setTimeout(dispatch(changeFilter(filter)), 1000) and set the value to the
// current filter. Thus, when the queue element does have a value, simply
// update the value of that filter so that when changeFilter is finally called,
// it will use the latest value. When the setTimeout callback is called, it
// should clear the queue value at the same time, and the next time an event
// comes through, it should trigger the setTimeout to go once more. The point
// is to keep track of the latest filter value, but only call the expensive
// changeFilter() operation at intervals so as not to overload the cpu.

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
