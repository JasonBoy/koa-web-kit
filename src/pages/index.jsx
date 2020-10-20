import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from 'assets/static/logo.svg';
import { getRoutes } from 'modules/router-utils';

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

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: { msg: 'Errored' },
      list: [
        {
          key: 1,
          path: '/hello',
          name: 'ssr name',
        },
      ],
    };
  }

  componentDidMount() {
    const routes = getRoutes(true);
    this.setState({ list: routes });
    const name = 'index';
    const weakDeps = require.resolveWeak(`src/pages/${name}`);
    console.log('weakDeps: ', weakDeps);
    console.log(
      '__webpack_modules__[weakDeps]: ',
      __webpack_modules__[weakDeps],
    );
    console.log(
      'require.cache[weakDeps]: ',
      require.cache[require.resolveWeak(`src/pages/hello`)],
    );
  }

  makeError = (e) => {
    e.preventDefault();
    this.setState({ error: null });
  };

  render() {
    const { list } = this.state;

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
          {list.map((route) => {
            return (
              <Link
                key={route.key}
                className="text-blue-500 hover:text-blue-700"
                to={route.path}
              >
                {route.name}
              </Link>
            );
          })}
          {/*<Link className="text-blue-500 hover:text-blue-700" to="/">
            Home
          </Link>*/}
          <Link className="text-blue-500 hover:text-blue-700" to="/hello">
            Hello async
          </Link>
          {/*<Link className="text-blue-500 hover:text-blue-700" to="/hello/async">
            Hello Async
          </Link>
          <Link className="text-blue-500 hover:text-blue-700" to="/github">
            Github
          </Link>*/}
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

export default Index;
