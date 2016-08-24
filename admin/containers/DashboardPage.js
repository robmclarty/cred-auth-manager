import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { login } from '../actions';
import DashboardComponent from '../components/Dashboard';
import Page from '../components/Page'

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  users: state.users.list,
  resources: state.resources.list
});

const mapDispatchToProps = dispatch => ({
  //onSubmit: creds => dispatch(login(creds)).then(dispatch(push(`/admin/users`)))
});

const Dashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardComponent);

const DashboardPage = () => (
  <Page name="Dashboard">
    <Dashboard />
  </Page>
)

export default DashboardPage;
