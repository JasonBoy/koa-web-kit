import "../node_modules/bootstrap/scss/bootstrap-flex.scss";
import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/header/header.jsx';

if(process.env.NODE_ENV) {
  console.log('console env');
  console.log(process.env.NODE_ENV);
}
console.log(VERSION);
if(PROD_MODE) {
  console.log('prod mode');
} else {
  console.log('not prod mode');
}
console.log('yyyy');
ReactDOM.render(<Header />, document.getElementById('header'));