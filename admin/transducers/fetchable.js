const fetchable = (reducer, actionTypes) => {
  const { FETCH_PENDING, FETCH_SUCCESS, FETCH_FAIL } = actionTypes;
  const initialState = {
    ...reducer(undefined, {}),
    isFetching: false,
    errorMessage: '',
    lastUpdated: Date.now()
  };

  return (state = initialState, action) => {
    const { isFetching, errorMessage, lastUpdated } = state;

    switch (action.type) {
    case FETCH_PENDING:
      return {
        ...state,
        isFetching: true
      };
    case FETCH_SUCCESS:
      return {
        ...state,
        isFetching: false,
        lastUpdated: action.receivedAt
      };
    case FETCH_FAIL:
      return {
        ...state,
        isFetching: false,
        errorMessage: action.message
      };
    default:
      return reducer(state, action);
    }
  };
};

export default fetchable;
