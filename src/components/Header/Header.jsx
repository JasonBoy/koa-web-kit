import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../logo.svg';
import styled, { keyframes } from 'styled-components';

const logoRotate = keyframes`
from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
`;

const StyledAppHeader = styled.div`
  text-align: center;
  background-color: #222;
  padding: 20px;
  color: white;
  .app-logo {
    animation: ${logoRotate} infinite 20s linear;
    height: 80px;
  }
`;

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <StyledAppHeader>
        <img src={logo} className="app-logo" alt="logo" />
        <h2>Welcome to {this.props.appName}</h2>
        <div id="portal">portal placeholder</div>
      </StyledAppHeader>
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
