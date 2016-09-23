import React, { PropTypes } from 'react';

const Register = React.createClass({
  displayName: 'Register',

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
      <form onSubmit={this.onSubmit} className="register-form">
        <div className="field">
            <label htmlFor="username">Username</label>
            <input
                type="text"
                ref="username"
                id="username"
                name="username"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
                type="email"
                ref="email"
                id="email"
                name="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
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
    );
  }
});

export default Register;
