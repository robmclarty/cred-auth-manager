import React, { PropTypes } from 'react';
import moment from 'moment';
import PaginationControls from './PaginationControls';

const UserList = ({
  users,
  isPending,
  page,
  total,
  per,
  order,
  by,
  filter,
  onClickUser,
  onClickAddUser,
  onClickRemoveUser,
  onClickToggleSort,
  onClickPrevPage,
  onClickNextPage
}) => {
  const usernameButtonClass = by === 'username' ? order : '';
  const emailButtonClass = by === 'email' ? order : '';
  const statusButtonClass = by === 'status' ? order : '';
  const lastLoginButtonClass = by === 'lastLogin' ? order : '';

  return isPending ? false : (
    <div className="list-container">
      <button
          className="new-user-button"
          onClick={e => onClickAddUser()}>
        New User
      </button>

      <PaginationControls
          page={page}
          total={total}
          onClickNextPage={onClickNextPage}
          onClickPrevPage={onClickPrevPage}
      />

      <table className="resource-list">
        <thead>
          <tr>
            <th>
              <button
                  className={usernameButtonClass}
                  onClick={e => onClickToggleSort('username')}>
                Username
              </button>
            </th>
            <th>
              <button
                  className={emailButtonClass}
                  onClick={e => onClickToggleSort('email')}>
                Email
              </button>
            </th>
            <th>
              <button
                  className={statusButtonClass}
                  onClick={e => onClickToggleSort('status')}>
                Status
              </button>
            </th>
            <th>
              <button
                  className={lastLoginButtonClass}
                  onClick={e => onClickToggleSort('lastLogin')}>
                Last Login
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const status = user.isActive ? 'active' : 'disabled';
            const lastLoginDate = new Date(user.loginAt);
            const lastLoginMoment = moment(lastLoginDate).calendar();

            return (
              <tr
                  key={user.id}
                  onClick={e => onClickUser(user.id)}>
                <td><b>{user.username}</b></td>
                <td>{user.email}</td>
                <td>{status}</td>
                <td>{lastLoginMoment}</td>
                <td>
                  <button
                      className="list-remove-button"
                      onClick={e => onClickRemoveUser(user.id)}>
                    remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.array,
  isPending: PropTypes.bool,
  page: PropTypes.number,
  per: PropTypes.number,
  order: PropTypes.string,
  by: PropTypes.string,
  filter: PropTypes.string,
  onClickUser: PropTypes.func,
  onClickToggleSort: PropTypes.func,
  onClickPrevPage: PropTypes.func,
  onClickNextPage: PropTypes.func
};

export default UserList;
