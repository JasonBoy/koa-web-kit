/**
 * Created by jason on 31/01/2018.
 */

import React from 'react';
import './Hello.scss';

class Hello extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: 'Hello2'
    };
  }

  componentDidMount() {
    console.log('hello created!');
    this.setState({
      name: 'Hello Created!'
    })
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
