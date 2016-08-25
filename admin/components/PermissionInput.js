import React, { PropTypes } from 'react'

const PermissionInput = ({
  resourceName,
  permissions,
  action,
  onChange
}) => {
  const hasAction = permissions[resourceName] &&
    permissions[resourceName].actions &&
    permissions[resourceName].actions.includes(action)
  const key = `${ resourceName }:${ action }`

  return (
    <li className="action-item" key={key}>
      <input
          type="checkbox"
          checked={hasAction}
          className="action-checkbox"
          id={key}
          data-resource-name={resourceName}
          data-action={action}
          onChange={onChange}
      />
      <label htmlFor={action}>{action}&nbsp;</label>
    </li>
  )
}

export default PermissionInput
