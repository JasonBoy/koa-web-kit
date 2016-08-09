import React from 'react';
import ReactDOM from 'react-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
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