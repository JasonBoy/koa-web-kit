//import bootstrap css
// import './content/bootstrap-css';

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Header from './components/Header';
import Footer from './components/Footer';

injectTapEventPlugin();

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
          href: 'http://baidu.com',
          text: 'xxx'
        },
        {
          id: 2,
          href: 'http://baidu.com/2',
          text: 'yyy'
        }
      ]
    };
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <Header />
          <Footer links={this.state.links} copyright={"eju2016"}/>
        </div>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);