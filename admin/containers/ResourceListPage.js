import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux';
import {
  addResource,
  updateResource,
  removeResource,
  gotoResourcePage,
  nextResourcePage,
  prevResourcePage,
  sortResources
} from '../actions'
import Page from '../components/Page'
import ResourceList from '../components/ResourceList'

const ResourceListPageComponent = props => (
  <Page name="Resources">
    <button
        className="new-user-button"
        onClick={e => props.onClickAddResource()}>
      New Resource
    </button>

    <ResourceList
      resources={props.resources}
      isPending={props.isPending}
      page={props.page}
      total={props.total}
      per={props.per}
      order={props.order}
      by={props.by}
      filter={props.filter}
      onClickResource={props.onClickResource}
      onClickToggleSort={props.onClickToggleSort}
      onClickNextPage={props.onClickNextPage}
      onClickPrevPage={props.onClickPrevPage}
    />
  </Page>
)

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
  onClickResource: id => dispatch(push(`/admin/resources/${ id }`)),
  onClickAddResource: () => dispatch(push(`/admin/resources/new`)),
  onClickToggleSort: by => dispatch(sortResources(by)),
  onClickNextPage: () => dispatch(nextResourcePage()),
  onClickPrevPage: () => dispatch(prevResourcePage())
})

const ResourceListPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceListPageComponent)

export default ResourceListPage
