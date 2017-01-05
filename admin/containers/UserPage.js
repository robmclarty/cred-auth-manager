import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { updateUser, addUser, removeUser } from '../actions'
import UserForm from '../components/UserForm'
import Page from '../components/Page'

const UserPageComponent = ({
  user,
  isPending,
  resources,
  isAuthenticated,
  onSubmit,
  onClickRemove
}) => (
  <Page name={user.id ? 'Modify User' : 'Add User'}>
    <UserForm
        user={user}
        isPending={isPending}
        resources={resources}
        isAuthenticated={isAuthenticated}
        onSubmit={onSubmit}
    />

    {user.id &&
      <aside className="page-controls">
        <button
            className="remove-button"
            onClick={e => {
              e.preventDefault()
              onClickRemove(user.id)
            }}>
          remove
        </button>
      </aside>
    }
  </Page>
)

// Use a purposely invalid id if its value is "new" in order to trigger the user
// form in "add user" mode as opposed to "update user" mode.
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id
  const userId = paramId === 'new' ? -1 : Number(paramId)
  const user = state.users.list.find(user => user.id === userId)

  return {
    user: user || {},
    isPending: state.users.isFetching,
    resources: state.resources.list,
    isAuthenticated: state.auth.isAuthenticated
  }
}

// If the id param is exactly "new" then use the `addUser` action, otherwise
// treat it as a regular user id and use the `updateUser` action for `onSubmit`.
const mapDispatchToProps = (dispatch, ownProps) => {
  const isNew = ownProps.params.id === 'new'

  return {
    onSubmit: props => dispatch(isNew ? addUser(props) : updateUser(props)),
    onClickRemove: id => {
      if (confirm('Are you sure?')) dispatch(removeUser(id))
    }
  }
}

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPageComponent)

export default UserPage
