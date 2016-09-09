import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { login } from '../actions'
import Dashboard from '../components/Dashboard'
import Page from '../components/Page'

const DashboardPageComponent = ({
  isAuthenticated,
  users,
  resources,
  onClickLogin
}) => (
  <Page name={isAuthenticated ? 'Dashboard' : 'Welcome'}>
    <Dashboard
       isAuthenticated={isAuthenticated}
       users={users}
       resources={resources}
       onClickLogin={onClickLogin}
    />
  </Page>
)

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  users: state.users.list,
  resources: state.resources.list
})

const mapDispatchToProps = dispatch => ({
  onClickLogin: () => dispatch(push('/admin/login'))
})

const DashboardPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardPageComponent)

export default DashboardPage
