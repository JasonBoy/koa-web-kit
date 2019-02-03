import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

// import s from './Home.scss'; //CSS_MODULES
import './Home.scss';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: { msg: 'Errored' },
    };
  }

  componentDidMount() {}

  makeError = e => {
    e.preventDefault();
    this.setState({ error: null });
  };

  render() {
    return (
      <div
        className={classnames(
          'container'
          // s.home,
        )}
      >
        <h3 className={'text-center'}>Home page</h3>
        <div className={'list-group'}>
          <Link className={classnames('list-group-item', 'active')} to="/">
            Home
          </Link>
          <Link className={'list-group-item'} to="/hello/sub-hello">
            Hello
          </Link>
          <Link className={'list-group-item'} to="/hello">
            Hello Webpack 4
          </Link>
          <>
            <Link className="list-group-item" to="/hello-2">
              Hello 2
            </Link>
            <Link className={'list-group-item'} to="/github">
              Github
            </Link>
          </>
          <a className={'list-group-item'} href="#" onClick={this.makeError}>
            {this.state.error.msg}
          </a>
        </div>
      </div>
    );
  }
}

export default Home;
