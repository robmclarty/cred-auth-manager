import React, { PropTypes } from 'react';
import moment from 'moment';
import PaginationControls from './PaginationControls';

const ResourceList = ({
  resources,
  isPending,
  page,
  total,
  per,
  order,
  by,
  filter,
  onClickResource,
  onClickToggleSort,
  onClickPrevPage,
  onClickNextPage
}) => {
  const nameButtonClass = by === 'name' ? order : '';
  const urlButtonClass = by === 'url' ? order : '';
  const actionsButtonClass = by === 'actions' ? order : '';
  const updatedButtonClass = by === 'lastLogin' ? order : '';

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
                      className={nameButtonClass}
                      onClick={e => onClickToggleSort('name')}>
                    Name
                  </button>
                </th>
                <th>
                  <button
                      className={urlButtonClass}
                      onClick={e => onClickToggleSort('url')}>
                    Url
                  </button>
                </th>
                <th>
                  <button
                      className={updatedButtonClass}
                      onClick={e => onClickToggleSort('updatedAt')}>
                    Updated At
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {resources.map(resource => {
                const updatedDate = new Date(resource.updatedAt);
                const updatedMoment = moment(updatedDate).calendar();

                return (
                  <tr
                      key={resource.id}
                      onClick={e => onClickResource(resource.id)}>
                    <td><b>{resource.name}</b></td>
                    <td>{resource.url}</td>
                    <td>{updatedMoment}</td>
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

ResourceList.propTypes = {
  resources: PropTypes.array,
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

export default ResourceList;
