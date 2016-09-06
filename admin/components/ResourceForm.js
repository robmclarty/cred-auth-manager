import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const ResourceForm = React.createClass({
  displayName: 'ResourceForm',

  propTypes: {
    resource: PropTypes.object,
    isPending: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
    onSubmit: PropTypes.func
  },

  getDefaultProps: function () {
    return {
      resource: {},
      isPending: true,
      isAuthenticated: false
    }
  },

  onSubmit: function (e) {
    e.preventDefault();

    const resourceProps = {
      name: this.refs.name.value,
      url: this.refs.url.value,
      isActive: this.refs.isActive.checked,
      actions: this.refs.actions.value.split(' ')
    }

    // If this is updating an existing resource with an id, add it, otherwise if
    // this is a new resource with no id, leave it out.
    if (this.props.resource.id) Object.assign(resourceProps, {
      id: this.props.resource.id
    })

    this.props.onSubmit(resourceProps);
  },

  render: function () {
    const { resource, isPending, isAuthenticated } = this.props

    if (isPending || !resource || !isAuthenticated) return false

    const stringifiedActions = resource.actions ? resource.actions.join(' ') : ''

    return (
      <form onSubmit={this.onSubmit} className="resource-form">
        <div className="field">
          <label htmlFor="name">Name</label>
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
          <label htmlFor="actions">Actions</label>
          <input
              type="text"
              ref="actions"
              id="actions"
              name="actions"
              defaultValue={stringifiedActions}
          />
        </div>
        <div className="submit-group">
          <button
              type="submit"
              onClick={this.onSubmit}>
            Save
          </button>
          <span className="spacer">or</span>
          <Link to="/admin/resources">cancel</Link>
        </div>
      </form>
    )
  }
})

export default ResourceForm
