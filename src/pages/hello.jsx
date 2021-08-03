/**
 * Created by jason on 31/01/2018.
 */

import React from 'react';
// import r, { api, Request } from 'modules/Request';
import styled from 'styled-components';

const StyledHello = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: pink;
`;

class Hello extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: 'Hello webpack 5',
    };
  }

  componentDidMount() {
    console.log('hello created!');
    // this.setState({
    //   name: 'Hello Created!',
    // });
    // this.xxx();

    //api test
    // r.get(api.TEST, { page: 1 });
    // r.get(api.TEST_6, { page: 2 });
    // r.post(api.TEST_2, { a: 1, b: 2 }, { qs: { page: 2, pageSize: 10 } });
    //
    // const r2 = new Request({ form: true, apiPrefix: '/api-proxy-3' });
    // r2.post(api.TEST_3, { a: 1, b: 2, c: 'https://github.com' });
    // r2.put(api.TEST_4, { a: 1, b: 2 }, { noPrefix: true });
    // const r3 = new Request({ form: true, noPrefix: true });
    // r3.delete(api.TEST_5, { a: 1, b: 2 });
  }

  render() {
    return (
      <StyledHello>
        <h3 className="color-red">Hello webpack 4</h3>
        <span className="color-green">Hello</span>{' '}
        <code>Component: {this.state.name || 'xxx'}</code>
        {/*<p>{this.yyy()}</p>*/}
      </StyledHello>
    );
  }
}

export default Hello;
