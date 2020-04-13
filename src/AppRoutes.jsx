import React from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';
import Home from 'components/Home';
import Hello from 'components/Hello';
import Hello2 from 'components/Hello2';

import { AppContext } from 'modules/context';

const Loading = <h3>Loading...</h3>;

/*const Loading = ({ pastDelay, error }) => {
  if (error) {
    console.log(error);
    return error.msg || 'OOPS!';
  }
  return pastDelay ? <h3>Loading...</h3> : null;
};*/

const HelloAsyncLoadable = loadable(
  () =>
    import(
      /* webpackChunkName: "components_Hello_async" */ 'components/HelloAsync'
    ),
  {
    fallback: Loading,
  },
);

const Github = loadable(
  () => import(/* webpackChunkName: "components_Github" */ 'components/Github'),
  {
    fallback: Loading,
  },
);

function AppRoutes({ context, initialData }) {
  const { Provider } = AppContext;
  return (
    <Switch>
      <Route
        exact
        path="/hello-context"
        render={props => (
          <React.Fragment>
            <Provider value={context}>
              <Hello2 {...props} />
            </Provider>
            <hr />
            <p className="text-center">
              Below is default value from AppContext
            </p>
            <Hello2 {...props} />
          </React.Fragment>
        )}
      />
      <Route
        exact
        path="/github"
        render={props => <Github branches={initialData.github} {...props} />}
      />
      <Route exact path="/hello/sync" component={Hello} />
      <Route
        exact
        path="/hello/async"
        render={props => <HelloAsyncLoadable {...props} />}
      />
      <Route path="/" component={Home} />
    </Switch>
  );
}

AppRoutes.propTypes = {
  initialData: PropTypes.object,
  context: PropTypes.any,
};

export default AppRoutes;
