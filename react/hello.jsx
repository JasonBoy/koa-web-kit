// var React = require('react');
// var ReactDOM = require('react-dom');
import React from 'react';
import ReactDOM from 'react-dom';

class Hello extends React.Component {
  render() {
    return <h1>Hello
        <p>world</p>
      </h1>
  }
}

ReactDOM.render(<Hello/>, document.getElementById('hello'));
