import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
// import loadable from '@loadable/component';
// import Index from './pages/index';
// import Hello from './pages/hello';
import Loading from 'components/Loading';
import { getRoutes } from 'modules/router';

const routes = getRoutes();
console.log('routes: ', routes);

/*
const HelloAsyncLoadable = loadable(
  () =>
    import(
      /!* webpackChunkName: "components_Hello_async" *!/ 'pages/hello-async'
    ),
  {
    fallback: <Loading />,
  },
);

const Github = loadable(
  () => import(/!* webpackChunkName: "components_Github" *!/ './pages/github'),
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
      <Route path="/" component={Index} />
    </Switch>
  );
}
*/

function AppRoutes() {
  // return 'xxx';
  return (
    <Switch>
      {routes.map(({ name, path, component: RouteComponent }) => (
        <Route
          key={name}
          exact={true}
          path={path}
          render={(props) => {
            return <RouteComponent fallback={<Loading />} {...props} />;
          }}
        />
      ))}
    </Switch>
  );
}

AppRoutes.propTypes = {
  initialData: PropTypes.object,
};

export default AppRoutes;
