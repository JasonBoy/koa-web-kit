import React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';

const StyledHome = styled.div`
  font-size: 1.2rem;
`;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: { msg: 'Errored' },
    };
  }

  componentDidMount() {}
  render() {
    return (
      <StyledHome className="container">
        <h3 className={'text-center'}>Home page</h3>
        <div className="mb-2">
          <Button type="primary" href="/">
            Home
          </Button>
        </div>
        <div>
          <Button href="/hello/async">to hello/async</Button>
        </div>
      </StyledHome>
    );
  }
}

export default Home;
