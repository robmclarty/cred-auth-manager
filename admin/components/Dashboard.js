import React, { PropTypes } from 'react'
import { Link } from 'react-router';

// Return the 10 users who most recently logged in.
const last10Logins = users => {
  return users.sort((a, b) => {
    return new Date(a.loginAt).getTime() - new Date(b.loginAt).getTime()
  }).slice(0, 10)
}

const Dashboard = ({
  isAuthenticated,
  users,
  resources
}) => {
  if (!isAuthenticated) return (
    <div className="dashboard">
      <p>Welcome to the Cred Auth Manager admin interface.</p>
      <Link to="/admin/login">Login</Link>
    </div>
  )

  return (
    <div className="dashboard">
      <div className="usersTotal">
        (12)
        Active: 10
        Inactive: 2
      </div>
      <div className="usersAdmin">
        <ul>
          <li>rob</li>
          <li>alisha</li>
          <li>ilya</li>
        </ul>
      </div>
      <div className="usersSignup"></div>
      <div className="usersModified"></div>
      <div className="usersLogin">
        <ul>
          {last10Logins(users).map(user => {
            <li>{user.name}</li>
          })}
        </ul>
      </div>
      <div className="resources"></div>
    </div>
  )
}

Dashboard.propTypes = {
  name: PropTypes.string,
  users: PropTypes.array,
  resources: PropTypes.array
}

export default Dashboard
