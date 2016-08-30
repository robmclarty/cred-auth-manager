import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { login } from '../actions'
import Dashboard from '../components/Dashboard'
import Page from '../components/Page'

const DashboardPageComponent = ({
  isAuthenticated,
  users,
  resources
}) => (
  <Page name={isAuthenticated ? 'Dashboard' : 'Homepage'}>
    <Dashboard
       isAuthenticated={isAuthenticated}
       users={users}
       resources={resources}
    />
  </Page>
)

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  users: state.users.list,
  resources: state.resources.list
})

const DashboardPage = connect(mapStateToProps)(DashboardPageComponent)

export default DashboardPage
