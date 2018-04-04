import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appName: 'React-v16',
      context: {
        userName: 'jason-in-app',
      },
    };
  }
  render() {
    const { Provider } = AppContext;
    return (
      <Router>
        <div>
          <Header appName={this.state.appName} />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/hello" component={Hello} />
            <Route
              exact
              path="/hello-2"
              render={() => (
                <React.Fragment>
                  <Provider value={this.state.context}>
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
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
