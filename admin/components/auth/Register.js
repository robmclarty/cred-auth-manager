import React, { PropTypes } from 'react';

const Register = React.createClass({
  displayName: 'Login',

  propTypes: {
    onSubmit: PropTypes.func.isRequired
  },

  onSubmit: function (e) {
    e.preventDefault();

    this.props.onSubmit({
      username: this.refs.username.value,
      password: this.refs.password.value,
      email: this.refs.email.value
    });
  },

  render: function () {
    return (
      <div>
        <h1>Create and Account</h1>
        <form onSubmit={this.onSubmit} className="login-form">
          <div className="field">
              <label htmlFor="username">Username</label>
              <br />
              <input
                  type="text"
                  ref="username"
                  id="username"
                  name="username"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <br />
              <input
                  type="email"
                  ref="email"
                  id="email"
                  name="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <br />
              <input
                  type="password"
                  ref="password"
                  id="password"
                  name="password"
              />
            </div>
            <button
                type="submit"
                onClick={this.onSubmit}>
              Sign Up
            </button>
        </form>
      </div>
    );
  }
});

export default Register;
