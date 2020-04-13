import 'src/style/index.css';
import 'modules/env';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadableReady } from '@loadable/component';
import App from './App';
import AppError from 'components/AppError';

const elRoot = document.getElementById('app');

const render = Component => {
  // eslint-disable-next-line no-undef
  if (__SSR__) {
    console.log('in SSR mode');
    loadableReady(() => {
      ReactDOM.hydrate(
        <AppError>
          <Component />
        </AppError>,
        elRoot,
      );
    });
    return;
  }
  ReactDOM.render(
    <AppError>
      <Component />
    </AppError>,
    elRoot,
  );
};

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    render(require('./App').default);
  });
  // module.hot.check().then(modules => {
  //   console.log('modules: ', modules);
  // });
  // module.hot.addStatusHandler((status) => {
  //   console.log('status: ', status);
  //   if (status === 'idle') {
  //     // window.location.reload()
  //   }
  // })
}
