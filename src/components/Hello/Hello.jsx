/**
 * Created by jason on 31/01/2018.
 */

import React from 'react';
import './Hello.scss';

class Hello extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className="hello">
        Hello <code>Component</code>
      </div>
    );
  }
}

export default Hello;
