import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AppError from 'components/AppError';
import './index.css';

const elRoot = document.getElementById('app');

const render = Component => {
  ReactDOM.render(
    <AppError>
      <Component />
    </AppError>,
    elRoot
  );
};

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    render(require('./App').default);
  });
}
