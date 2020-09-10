import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AppRoutes from './AppRoutes';

let initialData = {};
const initDataScript = document.getElementById('__INITIAL_DATA__');
if (initDataScript) {
  try {
    initialData = JSON.parse(initDataScript.innerText);
  } catch (err) {
    console.error(err);
  }
}
console.log('SSR initialData: ', initialData);

function App() {
  return (
    <Router>
      <AppRoutes initialData={initialData} />
    </Router>
  );
}

getPageModules();
function getPageModules() {
  const context = require.context('src/pages', true, /\.jsx?$/);
  console.log('context.keys(): ', context.keys());
  const modules = context.keys().map((key) => context(key));
  console.log('modules: ', modules);
}

export default App;
