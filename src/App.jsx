// import React from 'react';
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
if (__SSR__) {
  console.log('SSR initialData: ', initialData);
}

function App() {
  return (
    <Router>
      <AppRoutes initialData={initialData} />
    </Router>
  );
}

export default App;
