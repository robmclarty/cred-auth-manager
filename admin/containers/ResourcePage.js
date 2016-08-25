import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateResource } from '../actions';
import ResourceForm from '../components/ResourceForm';
import Page from '../components/Page'

const ResourcePageComponent = ({
  resource,
  isAuthenticated,
  onSubmit
}) => (
  <Page name="Modify Resource">
    <ResourceForm
        resource={resource}
        isAuthenticated={isAuthenticated}
        onSubmit={onSubmit}
    />
  </Page>
)

const mapStateToProps = (state, ownProps) => ({
  resource: state.resources.list.find(resource => resource.id === Number(ownProps.params.id)),
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch(updateResource(data))
});

const ResourcePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcePageComponent);

export default ResourcePage;
