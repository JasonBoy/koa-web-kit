import React, { Component } from 'react';
import logo from './logo.svg';
import './app.css';
import Hello from 'components/Hello';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appName: 'React-v16',
    };
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to {this.state.appName || 'React'}</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>HMR is enabled!</p>
        <Hello />
      </div>
    );
  }
}

export default App;
