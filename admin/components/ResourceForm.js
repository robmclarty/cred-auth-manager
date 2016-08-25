import React, { PropTypes } from 'react'

const ResourceForm = React.createClass({
  displayName: 'ResourceForm',

  propTypes: {
    resource: PropTypes.object,
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
      resource,
      isAuthenticated,
      onSubmit
    } = this.props

    if (!resource) return false

    return (
      <form onSubmit={onSubmit} className="resource-form">
        <div className="field">
            <label htmlFor="name">Name</label>
            <br />
            <input
                type="text"
                ref="name"
                id="name"
                name="name"
                defaultValue={resource.name}
            />
          </div>
          <div className="field">
            <label htmlFor="url">Url</label>
            <br />
            <input
                type="text"
                ref="url"
                id="url"
                name="url"
                defaultValue={resource.url}
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
                defaultChecked={resource.isActive}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Actions</label>
            <ul>
              {resource.actions.map(action => (
                <li key={action}>
                  {action}
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
    )
  }
})

export default ResourceForm
