import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';
import Home from 'components/Home';
// import Hello from 'components/Hello';
import Hello2 from 'components/Hello2';
// import Header from 'components/Header';

import { AppContext } from 'modules/context';

const LOADING_DELAY = 500;

const Loading = ({ pastDelay, error }) => {
  if (error) {
    console.log(error);
    return error.msg || 'OOPS!';
  }
  return pastDelay ? <h3>Loading...</h3> : null;
};

const Hello = Loadable({
  delay: LOADING_DELAY,
  loading: Loading,
  loader: () =>
    import(/* webpackChunkName: "components_Hello" */ 'components/Hello'),
});

const Github = Loadable({
  delay: LOADING_DELAY,
  loading: Loading,
  loader: () =>
    import(/* webpackChunkName: "components_Github" */ 'components/GitHub'),
});

/*const HelloBackup = Loadable({
  delay: LOADING_DELAY,
  loading: Loading,
  loader: () =>
    import('components/Hello'),
});*/

function AppRoutes(props) {
  const { Provider } = AppContext;
  return (
    <Switch>
      {/*<Route exact path="/hello" render={(props) => <Hello {...props}/>} />*/}
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
      <Route
        exact
        path="/github"
        render={() => <Github branches={props.initialData.github} />}
      />
      <Route exact path="/hello" component={Hello} />
      {/*<Route exact path="/hello-backup" component={HelloBackup} />*/}
      <Route path="/" component={Home} />
    </Switch>
  );
}

AppRoutes.propTypes = {
  initialData: PropTypes.object,
  context: PropTypes.any,
};

export default AppRoutes;
