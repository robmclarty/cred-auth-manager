import React, { PropTypes } from 'react'

const Page = ({ name, children }) => (
  <section className="page">
    {name &&
      <h1>{name}</h1>
    }

    <div>{children}</div>
  </section>
)

Page.propTypes = {
  name: PropTypes.string
}

export default Page
