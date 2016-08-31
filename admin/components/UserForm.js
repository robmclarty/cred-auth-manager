import React, { PropTypes } from 'react'
import { Link } from 'react-router'
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

    const userProps = {
      username: this.refs.username.value,
      password: this.refs.password.value,
      email: this.refs.email.value,
      isActive: this.refs.isActive.checked,
      isAdmin: this.refs.isAdmin.checked
    }

    // If this is updating an existing user with an id, add it, otherwise if
    // this is a new user with no id, leave it out.
    if (this.props.user.id) Object.assign(userProps, {
      id: this.props.user.id
    })

    console.log('props: ', userProps)

    this.props.onSubmit(userProps);
  },

  render: function () {
    const {
      user,
      resources,
      isAuthenticated
    } = this.props

    // If missing props, don't render anything.
    if (!user || !resources || !isAuthenticated) return false

    return (
      <form onSubmit={this.onSubmit} className="user-form">
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
                          permissions={user.permissions || {}}
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
              onClick={this.onSubmit}>
            Save
          </button>
          <span>or</span>
          <Link to="/admin/users">cancel</Link>
      </form>
    );
  }
});

export default UserForm;
