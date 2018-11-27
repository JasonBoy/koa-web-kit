import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

// import './Home.scss';
import style from 'bootstrap/scss/bootstrap.scss';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    console.log('style["list-group-item"]: ', style);
  }

  render() {
    return (
      <div className={style.container}>
        <h3 className={style['text-center']}>Home page</h3>
        <div className={style['list-group']}>
          <Link
            className={classnames(style['list-group-item'], style.active)}
            to="/"
          >
            Home
          </Link>
          <Link className={style['list-group-item']} to="/hello/sub-hello">
            Hello
          </Link>
          <Link className={style['list-group-item']} to="/hello">
            Hello Webpack 4
          </Link>
          <>
            <Link className="list-group-item" to="/hello-2">
              Hello 2
            </Link>
            <Link className={style['list-group-item']} to="/github">
              Github
            </Link>
          </>
        </div>
      </div>
    );
  }
}

export default Home;
