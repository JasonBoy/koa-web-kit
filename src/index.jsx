//import bootstrap css
import './content/bootstrap-css';

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import defaultTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Header from './components/Header';
import Footer from './components/Footer';

injectTapEventPlugin();
console.log(defaultTheme);
const muiTheme = getMuiTheme(defaultTheme);


class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    // this.handleRequestClose = this.handleRequestClose.bind(this);
    // this.handleTouchTap = this.handleTouchTap.bind(this);

    this.state = {
      open: false,
      links: [
        {
          id: 1,
          href: 'http://xxx.com',
          text: 'xxx'
        },
        {
          id: 2,
          href: 'http://yyy.com/2',
          text: 'yyy'
        }
      ]
    };
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Header />
          <Footer links={this.state.links} copyright={"2016"}/>
        </div>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);