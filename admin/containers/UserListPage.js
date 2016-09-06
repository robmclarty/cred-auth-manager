import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux';
import {
  sortUsers,
  gotoUserPage,
  nextUserPage,
  prevUserPage
} from '../actions'
import Page from '../components/Page'
import UserList from '../components/UserList'

const UserListPageComponent = props => (
  <Page name="Users">
    <UserList
      users={props.users}
      isPending={props.isPending}
      page={props.page}
      total={props.total}
      per={props.per}
      order={props.order}
      by={props.by}
      filter={props.filter}
      onClickUser={props.onClickUser}
      onClickToggleSort={props.onClickToggleSort}
      onClickNextPage={props.onClickNextPage}
      onClickPrevPage={props.onClickPrevPage}
    />

    <aside className="page-controls">
      <button
          className="new-user-button"
          onClick={e => props.onClickAddUser()}>
        New User
      </button>
    </aside>
  </Page>
)

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
  onClickAddUser: () => dispatch(push(`/admin/users/new`)),
  onClickToggleSort: by => dispatch(sortUsers(by)),
  onClickNextPage: () => dispatch(nextUserPage()),
  onClickPrevPage: () => dispatch(prevUserPage())
})

const UserListPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserListPageComponent)

export default UserListPage
