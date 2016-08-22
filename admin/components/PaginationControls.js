import React, { PropTypes } from 'react';

const PaginationControls = ({
  page,
  total,
  onClickPrevPage,
  onClickNextPage
}) => (
  <div className="pagination">
    {page > 1 &&
      <button
          className="pagination-prev"
          onClick={onClickPrevPage}>
        <span className="ion-arrow-left-a pagination-arrow-left"></span>
        Prev
      </button>
    }
    <div className="pagination-info">
      Page <b>{page}</b> of {total}
    </div>
    {page < total &&
      <button
          className="pagination-next"
          onClick={onClickNextPage}>
        Next
        <span className="ion-arrow-right-a pagination-arrow-right"></span>
      </button>
    }
  </div>
);

PaginationControls.propTypes = {
  page: PropTypes.number,
  total: PropTypes.number,
  onClickPrevPage: PropTypes.func,
  onClickNextPage: PropTypes.func
};

export default PaginationControls;
