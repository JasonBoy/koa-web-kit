import React from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';
import Home from './pages/home';
import Hello from './pages/hello';
import Loading from 'components/Loading';

const HelloAsyncLoadable = loadable(
  () =>
    import(
      /* webpackChunkName: "components_Hello_async" */ 'pages/hello-async'
    ),
  {
    fallback: <Loading />,
  },
);

const Github = loadable(
  () => import(/* webpackChunkName: "components_Github" */ './pages/github'),
  {
    fallback: <Loading />,
  },
);

function AppRoutes({ initialData }) {
  return (
    <Switch>
      <Route exact path="/hello/sync" component={Hello} />
      <Route exact path="/hello/async" component={HelloAsyncLoadable} />
      <Route
        exact
        path="/github"
        render={(props) => <Github branches={initialData.github} {...props} />}
      />
      <Route path="/" component={Home} />
    </Switch>
  );
}

AppRoutes.propTypes = {
  initialData: PropTypes.object,
};

export default AppRoutes;
