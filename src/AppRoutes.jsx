import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import Loading from 'components/Loading';
import { getRoutes } from 'modules/router-utils';
import NotFound from 'components/NotFound';

console.log('process.env.DYNAMIC_ROUTES: ', process.env.DYNAMIC_ROUTES);
const routes = process.env.DYNAMIC_ROUTES
  ? // dynamic routes from src/pages
    getRoutes()
  : //manual routes
    [
      {
        name: 'index',
        path: '/',
        component: loadable(() => import('pages/index')),
      },
      {
        name: 'hello',
        path: '/hello',
        component: loadable(() => import('pages/hello')),
      },
    ];
// console.log('routes: ', routes);

function AppRoutes() {
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
      <Route component={NotFound} />
    </Switch>
  );
}

AppRoutes.propTypes = {
  initialData: PropTypes.object,
};

export default AppRoutes;
