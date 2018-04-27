import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { AppContext } from 'modules/context';

function ShowUserName(props) {
  return (
    <AppContext.Consumer>
      {appContext => (
        <div className="text-center">
          <a className="btn btn-primary">{appContext.userName}</a>
        </div>
      )}
    </AppContext.Consumer>
  );
}

function HeaderPortal(props) {
  return ReactDOM.createPortal(
    props.children,
    document.getElementById('portal')
  );
}

class Hello2 extends React.Component {
  constructor(props) {
    super(props);

    console.log('in hello 2!!!');
  }

  state = {
    portalCount: 0,
  };

  componentDidMount() {}

  createPortal = () => {
    // console.log(this.portalContainer);
    this.setState(s => ({ portalCount: s.portalCount + 1 }));

    import(/* webpackChunkName: "modules_misc" */ 'modules/misc').then(misc => {
      console.log(misc);
      misc.test();
    });
  };

  render() {
    return (
      <div className="text-center">
        Hello2 page
        <div>
          <p>In AppContext:</p>
          <ShowUserName />
        </div>
        <hr />
        <button className="btn btn-primary" onClick={this.createPortal}>
          Create Portal to Header
        </button>
        {this.state.portalCount > 0 && (
          <div>
            <p>Fake portal container</p>
            <HeaderPortal>
              <p>{this.state.portalCount}th times btn from Hello2</p>
            </HeaderPortal>
          </div>
        )}
      </div>
    );
  }
}

export default Hello2;
