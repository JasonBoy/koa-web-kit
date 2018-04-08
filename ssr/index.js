import React from 'react';
import ReactDOMServer from 'react-dom/server';

import Home from 'components/Home';

class SSR {
  constructor() {}

  renderHome() {
    return ReactDOMServer.renderToString(<Home />);
  }
}

export default SSR;
