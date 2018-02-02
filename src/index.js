import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader'
import App from './App';
import './index.css';

const elRoot = document.getElementById('app');

const render = Component => {
  ReactDOM.render(
    <Component />
    /*<AppContainer>
      <Component />
    </AppContainer>*/
    ,
    elRoot,
  )
};

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    render(require('./App').default);
    // render(require('./App'));
    // render(App);
  })
}

// ReactDOM.render(
//   <App />,
//   document.getElementById('app')
// );
