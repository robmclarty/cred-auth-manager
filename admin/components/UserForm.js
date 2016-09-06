import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const checkboxName = (resourceName, action) => `${ resourceName }:${ action }`

const UserForm = React.createClass({
  displayName: 'UserForm',

  propTypes: {
    user: PropTypes.object,
    isPending: PropTypes.bool,
    resources: PropTypes.array,
    isAuthenticated: PropTypes.bool,
    onSubmit: PropTypes.func
  },

  getDefaultProps: function () {
    return {
      user: {},
      isPending: true,
      resources: [],
      isAuthenticated: false
    }
  },

  getInitialState: function () {
    return {
      permissionsChanged: false
    }
  },

  onChangePermission: function (e) {
    this.setState({ permissionsChanged: true })
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

    // If any permissions were changed, go through all the permissions in the
    // form and only add those that are checked.
    if (this.state.permissionsChanged) {
      userProps.permissions = {}

      this.props.resources.forEach(resource => {
        const actions = resource.actions.reduce((checkedActions, action) => {
          return this.refs[checkboxName(resource.name, action)].checked ?
            [...checkedActions, action] :
            checkedActions
        }, [])

        if (actions) userProps.permissions[resource.name] = { actions }
      })
    }

    // If this is updating an existing user with an id, add it, otherwise if
    // this is a new user with no id, leave it out.
    if (this.props.user.id) Object.assign(userProps, {
      id: this.props.user.id
    })

    this.props.onSubmit(userProps)
  },

  render: function () {
    const { user, isPending, resources, isAuthenticated } = this.props

    // If missing props or waiting for user to load, don't render anything.
    if (isPending || !user || !resources || !isAuthenticated) return false

    return (
      <form onSubmit={this.onSubmit} className="user-form">
        <div className="field">
          <label htmlFor="username">Username</label>
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
          <label htmlFor="permission-list">Permissions</label>
          <ul className="permission-list">
            {resources.map((resource, resourceIndex) => (
              <li
                  key={`resource:${ resourceIndex }`}
                  className="permission-item">
                <h4>{resource.name}</h4>
                <ul className="action-list">
                  {resource.actions.map((action, actionIndex) => {
                    const hasAction = user.permissions &&
                      user.permissions[resource.name] &&
                      user.permissions[resource.name].actions &&
                      user.permissions[resource.name].actions.includes(action)
                    const key = checkboxName(resource.name, action)

                    return (
                      <li className="action-item" key={key}>
                        <input
                            ref={key}
                            type="checkbox"
                            defaultChecked={hasAction}
                            className="action-checkbox"
                            id={key}
                            data-resource-name={resource.name}
                            data-action={action}
                            onChange={e => this.onChangePermission(e)}
                        />
                        <label htmlFor={action}>{action}&nbsp;</label>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="submit-group">
          <button
              type="submit"
              onClick={this.onSubmit}>
            Save
          </button>
          <span className="spacer">or</span>
          <Link to="/admin/users">cancel</Link>
        </div>
      </form>
    )
  }
})

export default UserForm
