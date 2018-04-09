import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';

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
          <a className="list-group-item active" href="/">
            Home
          </a>
          <a className="list-group-item" href="/hello">
            Hello
          </a>
          <a className="list-group-item" href="/hello-2">
            Hello 2
          </a>
        </div>
      </div>
    );
  }
}

export default Home;
