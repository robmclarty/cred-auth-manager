import React, { PropTypes } from 'react'

const Page = ({ name, children }) => (
  <div className="page">
    {name &&
      <h1>{name}</h1>
    }

    {children}

    <br />
    <br />
  </div>
)

Page.propTypes = {
  name: PropTypes.string,
  children: PropTypes.object
}

export default Page
