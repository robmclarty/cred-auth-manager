import React from 'react'
import { connect } from 'react-redux'
// import {
//   addUser,
//   updateUser,
//   removeUser,
//   gotoUserPage,
//   nextUserPage,
//   prevUserPage
// } from '../actions'
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
  // const users = state.users.pageList
  // const { page, total, per, order, by, filter } = state.users

  return {
    users: [],
    isPending: false, //state.users.isFetching,
    page: 1,
    total: 1,
    per: 10,
    order: 'asc',
    by: 'username',
    filter: ''
  }
}

const mapDispatchToProps = dispatch => ({
  onClickUser: (id, e) => console.log('clicked user', id, e),
  onClickToggleSort: (by, e) => console.log('clicked toggle sort', by, e),
  onClickNextPage: () => console.log('clicked next'), //dispatch(nextUserPage()),
  onClickPrevPage: () => console.log('clicked prev'), //dispatch(prevUserPage()),
  onAddUser: () => console.log('clicked add user'), //dispatch(addUser(fakeUser())),
  onFetchUsers: () => console.log('clicked fetch users'), //dispatch(fetchUsers())
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
