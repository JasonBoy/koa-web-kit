/**
 * Created by jason on 31/01/2018.
 */

import React from 'react';
import './Hello.scss';
import r, { api } from 'modules/Request';

class Hello extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: 'Hello2',
    };
  }

  componentDidMount() {
    console.log('hello created!');
    this.setState({
      name: 'Hello Created!',
    });
    //api test
    r.get(api.TEST);
  }

  render() {
    return (
      <div className="hello">
        Hello <code>Component: {this.state.name || 'xxx'}</code>
      </div>
    );
  }
}

export default Hello;
