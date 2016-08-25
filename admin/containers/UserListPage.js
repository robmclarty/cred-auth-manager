import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux';
import {
  addUser,
  updateUser,
  removeUser,
  sortUsers,
  gotoUserPage,
  nextUserPage,
  prevUserPage
} from '../actions'
import Page from '../components/Page'
import UserListComponent from '../components/UserList'

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
  onClickUser: id => dispatch(push(`/admin/users/${ id }`)),
  onClickToggleSort: by => dispatch(sortUsers(by)),
  onClickNextPage: () => dispatch(nextUserPage()),
  onClickPrevPage: () => dispatch(prevUserPage()),
  onAddUser: () => dispatch(addUser(fakeUser())),
  onFetchUsers: () => dispatch(fetchUsers())
})

const UserList = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserListComponent)

const UserListPage = () => (
  <Page name="Users">
    <UserList />
  </Page>
)

export default UserListPage
