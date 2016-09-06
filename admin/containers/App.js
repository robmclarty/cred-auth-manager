import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from './HeaderContainer';
import Flash from './FlashContainer';

const currentYear = new Date().getFullYear();

const App = ({ isAuthenticated, currentPath, children }) => (
  <div className="app-container">
    <Header currentPath={currentPath} />

    <main>
      <Flash />

      {children}
    </main>

    <footer>&copy; {currentYear} Rob McLarty</footer>
  </div>
);

App.propTypes = {
  isAuthenticated: PropTypes.bool,
  children: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(App);
