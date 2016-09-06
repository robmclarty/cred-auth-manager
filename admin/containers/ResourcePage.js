import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { updateResource, addResource, removeResource } from '../actions'
import ResourceForm from '../components/ResourceForm'
import Page from '../components/Page'

const ResourcePageComponent = ({
  resource,
  isPending,
  isAuthenticated,
  onSubmit,
  onClickRemove
}) => (
  <Page name={!resource.id ? 'Add Resource' : 'Modify Resource'}>
    <ResourceForm
        resource={resource}
        isPending={isPending}
        isAuthenticated={isAuthenticated}
        onSubmit={onSubmit}
    />

    {resource.id &&
      <aside className="page-controls">
        <button
            className="remove-button"
            onClick={e => {
              e.preventDefault()
              onClickRemove(resource.id)
            }}>
          remove
        </button>
      </aside>
    }
  </Page>
)

const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id
  const resourceId = paramId === 'new' ? -1 : Number(paramId)
  const resource = state.resources.list.find(resource => resource.id === resourceId)

  return {
    resource: resource || {},
    isPending: state.resources.isFetching,
    isAuthenticated: state.auth.isAuthenticated
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const isNew = ownProps.params.id === 'new'

  return {
    onSubmit: props => dispatch(isNew ? addResource(props) : updateResource(props)),
    onClickRemove: id => {
      if (confirm('Are you sure?')) dispatch(removeResource(id))
    }
  }
}

const ResourcePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcePageComponent)

export default ResourcePage
