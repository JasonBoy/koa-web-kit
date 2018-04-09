import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import Home from 'components/Home';
// import Hello from 'components/Hello';
import Hello2 from 'components/Hello2';
import Header from 'components/Header';

import { AppContext } from 'modules/context';

const Loading = () => <div>Loading...</div>;

const Hello = Loadable({
  loader: () =>
    import(/* webpackChunkName: "components_Hello" */ 'components/Hello'),
  loading: Loading,
});

function AppRoutes(props) {
  const { Provider } = AppContext;
  return (
    <Switch>
      <Route exact path="/hello" component={Hello} />
      <Route
        exact
        path="/hello-2"
        render={() => (
          <React.Fragment>
            <Provider value={props.context}>
              <Hello2 />
            </Provider>
            <hr />
            <p className="text-center">
              Below is default value from AppContext
            </p>
            <Hello2 />
          </React.Fragment>
        )}
      />
      <Route path="/" component={Home} />
    </Switch>
  );
}

export default AppRoutes;
