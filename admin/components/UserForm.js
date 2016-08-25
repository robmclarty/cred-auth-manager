import React, { PropTypes } from 'react'
import PermissionInput from './PermissionInput'

const onChange = () => {
  console.log('changed...')
}

const UserForm = React.createClass({
  displayName: 'UserForm',

  propTypes: {
    user: PropTypes.object,
    resources: PropTypes.array,
    isAuthenticated: PropTypes.bool,
    onSubmit: PropTypes.func
  },

  onSubmit: function (e) {
    e.preventDefault();

    this.props.onSubmit({

    });
  },

  render: function () {
    const {
      user,
      resources,
      isAuthenticated,
      onSubmit
    } = this.props

    // If missing props, don't render anything.
    if (!user || !resources || !isAuthenticated) return false

    return (
      <form onSubmit={onSubmit} className="user-form">
        <div className="field">
            <label htmlFor="username">Username</label>
            <br />
            <input
                type="text"
                ref="username"
                id="username"
                name="username"
                defaultValue={user.username}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <br />
            <input
                type="password"
                ref="password"
                id="password"
                name="password"
                placeholder="Leave blank to keep existing password"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <br />
            <input
                type="text"
                ref="email"
                id="email"
                name="email"
                defaultValue={user.email}
            />
          </div>
          <div className="field">
            <label htmlFor="isActive">Active</label>
            <br />
            <input
                type="checkbox"
                className="toggle"
                ref="isActive"
                id="isActive"
                name="isActive"
                defaultChecked={user.isActive}
            />
          </div>
          <div className="field">
            <label htmlFor="isAdmin">Admin</label>
            <br />
            <input
                type="checkbox"
                className="toggle"
                ref="isAdmin"
                id="isAdmin"
                name="isAdmin"
                defaultChecked={user.isAdmin}
            />
          </div>
          <div className="field">
            <label htmlFor="permissions">Permissions</label>
            <ul className="permissions">
              {resources.map((resource, resourceIndex) => (
                <li key={`resource:${ resourceIndex }`}>
                  <b>{resource.name}</b>
                  <br />
                  <ul className="action-list">
                    {resource.actions.map((action, actionIndex) => (
                      <PermissionInput
                          resourceName={resource.name}
                          permissions={user.permissions}
                          action={action}
                          onChange={onChange}
                          key={`permission:${ actionIndex }`}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <button
              type="submit"
              onClick={onSubmit}>
            Update
          </button>
      </form>
    );
  }
});

export default UserForm;
