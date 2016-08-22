import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

// A higher order function which returns a redux-connected component that first
// checks if the current app state is authenticated. If it is, it renders the
// passed component, otherwise null. If auto-login did not work and the state
// is still unauthenticated, redirect to the login page.
const requireAuth = function (Component) {
  const AuthenticatedComponent = React.createClass({
    propTypes: {
      auth: PropTypes.object
    },

    // NOTE: Passing nextProps to checkAuth() here because the reference to
    // this.props in checkAuth will otherwise not be the current state.
    componentWillReceiveProps: function (nextProps) {
      this.checkAuth(nextProps.auth);
    },

    // If this condition is met, it means not only is the user not
    // authenticated, but there is no longer any attempt to try to
    // authenticate, or an attempt was made but failed. So redirect to login.
    checkAuth: function (auth) {
      if (!auth.isAuthenticated && !auth.isFetching) {
        this.props.redirectToLogin();
      }
    },

    render: function () {
      const isAuthenticated = this.props.auth.isAuthenticated;

      return isAuthenticated ?
        <Component {...this.props} /> :
        null;
    }
  });

  const mapStateToProps = state => ({
    auth: state.auth
  });

  const mapDispatchToProps = dispatch => ({
    redirectToLogin: () => dispatch(push(`/login`))
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthenticatedComponent);
};

export default requireAuth;
