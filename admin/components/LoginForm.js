import React, { PropTypes } from 'react';

const LoginForm = React.createClass({
  displayName: 'LoginForm',

  propTypes: {
    onSubmit: PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.refs.username.focus()
  },

  onSubmit: function (e) {
    e.preventDefault();

    this.props.onSubmit({
      username: this.refs.username.value,
      password: this.refs.password.value
    });
  },

  render: function () {
    return (
      <form onSubmit={this.onSubmit} className="login-form">
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
          Login
        </button>
      </form>
    );
  }
});

export default LoginForm;
