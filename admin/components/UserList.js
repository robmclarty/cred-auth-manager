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
  onClickToggleSort,
  onClickPrevPage,
  onClickNextPage
}) => {
  const usernameButtonClass = by === 'username' ? order : '';
  const emailButtonClass = by === 'email' ? order : '';
  const statusButtonClass = by === 'status' ? order : '';
  const lastLoginButtonClass = by === 'lastLogin' ? order : '';

  return (
    <section className="list-container">
      {!isPending &&
        <div>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
    </section>
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
