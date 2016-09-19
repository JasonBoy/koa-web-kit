//import bootstrap css
// import './content/bootstrap-css';

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Header from './components/header/header';

injectTapEventPlugin();

if (process.env.NODE_ENV) {
  console.log('console env');
  console.log(process.env.NODE_ENV);
}
console.log(VERSION);
if (PROD_MODE) {
  console.log('prod mode');
} else {
  console.log('not prod mode');
}
const App = () => (
  <MuiThemeProvider>
    <Header />
  </MuiThemeProvider>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);