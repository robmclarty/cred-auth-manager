import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import App from '../components/App';

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

const AppContainer = connect(mapStateToProps)(App);

export default AppContainer;
