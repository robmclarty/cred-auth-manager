import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../actions';
import UserForm from '../components/UserForm';
import Page from '../components/Page'

const UserPageComponent = ({
  user,
  resources,
  isAuthenticated,
  onSubmit
}) => (
  <Page name="Modify User">
    <UserForm
        user={user}
        resources={resources}
        isAuthenticated={isAuthenticated}
        onSubmit={onSubmit}
    />
  </Page>
)

const mapStateToProps = (state, ownProps) => ({
  user: state.users.list.find(user => user.id === Number(ownProps.params.id)),
  resources: state.resources.list,
  isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = dispatch => ({
  onSubmit: props => dispatch(updateUser(props))
})

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPageComponent);

export default UserPage;
