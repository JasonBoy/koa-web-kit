//bootstrap and custom
import 'scss/vendors.scss';
//app scss entry
import 'scss/index.scss';
// import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import App from './App';
import AppError from 'components/AppError';

const elRoot = document.getElementById('app');

const render = Component => {
  Loadable.preloadReady().then(() => {
    ReactDOM.hydrate(
      <AppError>
        <Component />
      </AppError>,
      elRoot
    );
  });
};

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    render(require('./App').default);
  });
}
