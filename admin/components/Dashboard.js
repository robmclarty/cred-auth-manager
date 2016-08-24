import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Chart from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

// Return the 10 users who most recently logged in.
const last10Logins = users => users.sort((a, b) => {
  return new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
}).slice(0, 10)

const adminUsers = users => users.filter(user => user.isAdmin && user.isActive)

const activeResources = resources => resources.filter(resource => resource.isActive)

const userSignupsChart = users => {
  // const data = users.reduce((dataset, user) => {
  //   console.log(user)
  //   if (user.isActive) dataset[0] += 1
  //   if (!user.isActive) dataset[1] += 1
  //
  //   return dataset
  // }, [0, 0])
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First dataset',
        fill: true,
        lineTension: 0.3,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [65, 59, 80, 81, 56, 55, 70]
      },
      {
        label: 'My First dataset',
        fill: true,
        lineTension: 0.3,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [100, 140, 80, 30, 111, 65, 94]
      }
    ]
  }
  const chartOptions = {
    animate: false,
    legend: { display: false },
    tooltips: { enabled: false }
  }

  return (
    <Line data={chartData} options={chartOptions} width={800} height={260} />
  )
}

const usersTotalChart  = users => {
  const chartData = {
    labels: ["Active", "Inactive"],
    datasets: [{
      data: [15, 2],
      backgroundColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255,99,132,1)'
      ]
    }]
  }
  const chartOptions = {
    animate: false
  }

  return (
    <Doughnut data={chartData} options={chartOptions} width={200} height={200} />
  )
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

  const usersTotalStyle = {
    display: 'block',
    position: 'relative',
    width: 200,
    height: 300
  }
  const totalUsersStyle = {
    display: 'block',
    position: 'absolute',
    fontSize: 60,
    fontWeight: 'bold',
    top: 120,
    left: '50%',
    transform: 'translate(-50%, 0)'
  }
  const recentNameStyle = {
    display: 'inline-block',
    width: 60
  }
  const cellStyle = {
    verticalAlign: 'top'
  }

  return (
    <div className="dashboard">
      <table>
        <tbody>
          <tr>
            <td style={cellStyle}>
              <div className="users-total" style={usersTotalStyle}>
                <h4>Total Users</h4>
                <div style={totalUsersStyle}>{users.length}</div>
                {usersTotalChart(users)}
              </div>
            </td>
            <td colSpan="2" style={cellStyle}>
              <div className="users-signup">
                <h4>Usage</h4>
                {userSignupsChart(users)}
              </div>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div className="users-admin">
                <h4>Active Admins</h4>
                <ul>
                  {adminUsers(users).map(user => (
                    <li key={user.id}><a href="">{user.username}</a></li>
                  ))}
                </ul>
              </div>
            </td>
            <td style={cellStyle}>
              <div className="users-login">
                <h4>Recently Logged In</h4>
                <ul>
                  {last10Logins(users).map(user => (
                    <li key={user.id}>
                      <span style={recentNameStyle}><a href="">{user.username}</a></span>
                      <span>{user.loginAt.slice(0, 10)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </td>
            <td style={cellStyle}>
              <div className="resources">
                <h4>Active Resources</h4>
                <ul>
                  {activeResources(resources).map(resource => (
                    <li key={resource.id}><a href="">{resource.name}</a></li>
                  ))}
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

Dashboard.propTypes = {
  name: PropTypes.string,
  users: PropTypes.array,
  resources: PropTypes.array
}

export default Dashboard
