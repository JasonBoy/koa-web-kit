import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import logo from '../../logo.svg';

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <div className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h2>Welcome to {this.props.appName}</h2>
        <div id="portal">portal placeholder</div>
      </div>
    );
  }
}

Header.defualtProps = {
  appName: 'React',
};

Header.propTypes = {
  appName: PropTypes.string,
};

export default Header;
