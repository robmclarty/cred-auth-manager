import React from 'react'
import { connect } from 'react-redux'
import {
  addResource,
  updateResource,
  removeResource,
  gotoResourcePage,
  nextResourcePage,
  prevResourcePage
} from '../actions'
import Page from '../components/Page'
import ResourceListComponent from '../components/ResourceList'

const mapStateToProps = state => {
  const resources = state.resources.pageList
  const { page, total, per, order, by, filter } = state.resources

  return {
    resources,
    isPending: state.resources.isFetching,
    page,
    total,
    per,
    order,
    by,
    filter
  }
}

const mapDispatchToProps = dispatch => ({
  onClickResource: (id, e) => console.log('clicked resource', id, e),
  onClickToggleSort: (by, e) => console.log('clicked toggle sort', by, e),
  onClickNextPage: () => dispatch(nextResourcePage()),
  onClickPrevPage: () => dispatch(prevResourcePage()),
  onAddResource: () => dispatch(addResource({})),
  onFetchResources: () => dispatch(fetchResources())
})

const ResourceList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceListComponent)

const ResourceListPage = () => (
  <Page name="Resources">
    <ResourceList />
  </Page>
)

export default ResourceListPage
