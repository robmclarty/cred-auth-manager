import React, { PropTypes } from 'react'

const Page = ({ name, children }) => (
  <section className="page">
    {name &&
      <h1>{name}</h1>
    }

    {children}
  </section>
)

Page.propTypes = {
  name: PropTypes.string,
  children: PropTypes.object
}

export default Page
