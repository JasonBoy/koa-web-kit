import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const elRoot = document.getElementById('app');

const render = Component => {
  ReactDOM.render(<Component />, elRoot);
};

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    render(require('./App').default);
  });
}
