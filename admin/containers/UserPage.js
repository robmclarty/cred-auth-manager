import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { updateUser, addUser, removeUser } from '../actions'
import UserForm from '../components/UserForm'
import Page from '../components/Page'

// Use this for "new" users so as not to trigger the falsy user check in the
// `UserForm` component if the user object is completely blank.
const emptyUser = {
  isEmpty: true
}

const UserPageComponent = ({
  user,
  resources,
  isAuthenticated,
  onSubmit,
  onClickRemoveUser
}) => (
  <Page name={user.isEmpty ? 'Add User' : 'Modify User'}>
    <UserForm
        user={user}
        resources={resources}
        isAuthenticated={isAuthenticated}
        onSubmit={onSubmit}
    />

    {!user.isEmpty &&
      <aside className="page-controls">
        <button
            className="list-remove-button"
            onClick={e => {
              e.preventDefault()
              onClickRemoveUser(user.id)
            }}>
          remove user
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
    user: user || emptyUser,
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
    onClickRemoveUser: id => dispatch(removeUser(id))
  }
}

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPageComponent)

export default UserPage
