import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from 'assets/static/logo.svg';

const StyledHome = styled.div`
  font-size: 1.2rem;
`;
const StyledTitle = styled.h3`
  img,
  span {
    vertical-align: middle;
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
      <StyledHome className="container">
        <StyledTitle className="text-center">
          <img className="mr-2" width={24} height={24} src={logo} alt="logo" />
          <span>Home</span>
        </StyledTitle>
        <div className={'list-group'}>
          <Link className="list-group-item active" to="/">
            Home
          </Link>

          <Link className={'list-group-item'} to="/hello-context">
            Hello React Context
          </Link>
          <>
            <Link className={'list-group-item'} to="/hello/sync">
              Hello Sync
            </Link>
            <Link className="list-group-item" to="/hello/async">
              Hello Async
            </Link>
          </>
          <Link className={'list-group-item'} to="/github">
            Github
          </Link>
          <a className={'list-group-item'} href="#" onClick={this.makeError}>
            {this.state.error.msg}
          </a>
        </div>
      </StyledHome>
    );
  }
}

export default Home;
