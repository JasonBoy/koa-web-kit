import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import Home from 'components/Home';

function AppRoutes({ context, initialData }) {
  return (
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  );
}

AppRoutes.propTypes = {
  initialData: PropTypes.object,
  context: PropTypes.any,
};

export default AppRoutes;
