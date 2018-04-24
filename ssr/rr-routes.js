import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';
import Home from 'components/Home';
// import Hello from 'components/Hello';
import Hello2 from 'components/Hello2';
import Header from 'components/Header';

import { AppContext } from 'modules/context';

const Loading = () => <div>Loading...</div>;

const Hello = Loadable({
  delay: 200,
  loading: Loading,
  loader: () =>
    import(/* webpackChunkName: "components_Hello" */ 'components/Hello'),
});

const Github = Loadable({
  delay: 200,
  loading: Loading,
  loader: () =>
    import(/* webpackChunkName: "components_Github" */ 'components/Github'),
});

const routes = [
  {
    path: '/hello',
    exact: true,
    component: Hello,
  },
  {
    path: '/hello-2',
    exact: true,
  },
  {
    path: '/github',
    exact: true,
    component: Github,
  },
  {
    path: '/',
    component: Home,
  },
];

export default routes;
