import React from 'react'
import { connect } from 'react-redux'
import {
  addUser,
  updateUser,
  removeUser,
  gotoUserPage,
  nextUserPage,
  prevUserPage
} from '../../actions'
import Page from '../../components/Page'
import UserList from '../../components/users/UserList'

const fakeUser = () => {
  const newId = Date.now()

  return {
    id: newId,
    name: `New User ${ newId }`
  }
}

const mapStateToProps = state => {
  const users = state.users.pageList
  const { page, total, per, order, by, filter } = state.users

  return {
    users,
    isPending: state.users.isFetching,
    page,
    total,
    per,
    order,
    by,
    filter
  }
}

const mapDispatchToProps = dispatch => ({
  onClickUser: (id, e) => console.log('clicked user', id, e),
  onClickToggleSort: (by, e) => console.log('clicked toggle sort', by, e),
  onClickNextPage: () => dispatch(nextUserPage()),
  onClickPrevPage: () => dispatch(prevUserPage()),
  onAddUser: () => dispatch(addUser(fakeUser())),
  onFetchUsers: () => dispatch(fetchUsers())
})

const UserListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserList)

const UserListPage = () => (
  <Page name="Users">
    <UserListContainer />
  </Page>
)

export default UserListPage
