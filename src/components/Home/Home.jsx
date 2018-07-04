import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// import './Home.scss';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div className="home container">
        <h3 className="text-center">Home page</h3>
        <div className="list-group">
          <Link className="list-group-item active" to="/">
            Home
          </Link>
          <Link className="list-group-item" to="/hello/sub-hello">
            Hello
          </Link>
          <Link className="list-group-item" to="/hello">
            Hello Webpack 4
          </Link>
          <Link className="list-group-item" to="/hello-2">
            Hello 2
          </Link>
          <Link className="list-group-item" to="/github">
            Github
          </Link>
        </div>
      </div>
    );
  }
}

export default Home;
