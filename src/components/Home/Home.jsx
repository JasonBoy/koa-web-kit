import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from 'assets/static/logo.svg';
import './Home.css';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;
const StyledHome = styled.div`
  font-size: 1.2rem;
`;
const StyledTitle = styled.h3`
  img,
  span {
    vertical-align: middle;
  }
  .logo-img {
    animation: ${rotate} 3s linear infinite;
  }
`;
const StyledList = styled.div`
  width: 300px;
  a {
    display: block;
  }
`;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: { msg: 'Errored' },
    };
  }

  componentDidMount() {}

  makeError = e => {
    e.preventDefault();
    this.setState({ error: null });
  };

  render() {
    return (
      <StyledHome className="home-page container mx-auto">
        <StyledTitle className="text-center mt-3">
          <img
            className="logo-img mr-2 inline-block object-contain object-center"
            width={30}
            height={30}
            src={logo}
            alt="logo"
          />
          <span>Home</span>
        </StyledTitle>
        <StyledList className="mx-auto">
          <Link className="text-blue-500 hover:text-blue-700" to="/">
            Home
          </Link>
          <Link
            className="text-blue-500 hover:text-blue-700"
            to="/hello-context"
          >
            Hello React Context
          </Link>
          <Link className="text-blue-500 hover:text-blue-700" to="/hello/sync">
            Hello Sync
          </Link>
          <Link className="text-blue-500 hover:text-blue-700" to="/hello/async">
            Hello Async
          </Link>
          <Link className="text-blue-500 hover:text-blue-700" to="/github">
            Github
          </Link>
          <a
            className="text-blue-500 hover:text-blue-700"
            href="#"
            onClick={this.makeError}
          >
            {this.state.error.msg}
          </a>
        </StyledList>
      </StyledHome>
    );
  }
}

export default Home;
