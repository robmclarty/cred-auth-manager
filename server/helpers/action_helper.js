'use strict'

// Return a new array which merges oldActions[] with newActions[] without
// duplicates.
const addActions = ({ actions = [], newActions = [] }) => {
  const updatedActions = newActions.filter(action => notEmptyOrInList(action, actions))

  const uniqueActions = actions.reduce((acc, action) => {
    return notEmptyOrInList(action, acc) ? [...acc, action] : acc
  }, [...updatedActions])

  return [...uniqueActions, ...updatedActions]
}

// Return a new array containing only the elements in actions[] which do not
// match any of the elements in removedActions[].
const removeActions = (actions, removedActions) => {
  return removedActions.reduce((remainingActions, action) => {
    const index = remainingActions.indexOf(action)

    return [
      ...remainingActions.slice(0, index),
      ...remainingActions.slice(index + 1)
    ]
  }, [...actions])
}

module.exports = {
  addActions,
  removeActions
}
