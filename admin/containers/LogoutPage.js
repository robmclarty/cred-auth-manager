import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { logout } from '../actions';
import Page from '../components/Page'

// This component isn't absolutely necessary and will never be visited through
// the normal flow of the app. But if a user navigates their address bar to
// `/admin/logout` this page will be rendered, logout the user, and redirect
// them to the root page.
const Logout = React.createClass({
  displayName: 'Logout',

  propTypes: {
    logout: PropTypes.func
  },

  componentDidMount: function () {
    this.props.logout()
  },

  render: function () {
    return (
      <Page name="Logging out...">
        <p>You will be redirected shortly.</p>
      </Page>
    )
  }
})

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
})

const LogoutPage = connect(null, mapDispatchToProps)(Logout)

export default LogoutPage
