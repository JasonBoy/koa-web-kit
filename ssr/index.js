import React from 'react';
import { StaticRouter } from 'react-router';
import ReactDOMServer from 'react-dom/server';

import AppRoutes from 'src/AppRoutes';

// import Hello2 from 'components/Hello2';
// import Hello from 'components/Hello';
import Home from 'components/Home';
//
// const RouterApp = (
//   <StaticRouter location={}
//                 context={context}>
//
//   </StaticRouter>
// );

function SSRDemo(props) {
  return <div>ssr demo</div>;
}

const defaultContext = {
  userName: 'ssr-jason',
};

class SSR {
  constructor() {}

  renderHome(url) {
    console.log('url: %s', url);
    const context = {};
    return ReactDOMServer.renderToString(
      <StaticRouter location={url} context={context}>
        <AppRoutes context={defaultContext} />
      </StaticRouter>
    );
  }
}

export default SSR;
