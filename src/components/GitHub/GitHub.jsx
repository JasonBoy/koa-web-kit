import React from 'react';
import PropTypes from 'prop-types';
import './GitHub.scss';
import isEmpty from 'lodash.isempty';
import { Request } from 'modules/Request';

class GitHub extends React.Component {
  constructor(props) {
    super(props);

    this.githubRequest = new Request({ noPrefix: true });

    // console.log('props.branches:', this.props.branches);
    this.state = {
      github: this.props.branches,
    };
  }

  componentDidMount() {
    if (isEmpty(this.state.github)) {
      this.githubRequest
        .get('https://api.github.com/repos/jasonboy/wechat-jssdk/branches')
        .then(data => {
          this.setState({ github: data });
        });
    }
  }

  render() {
    if (isEmpty(this.state.github)) {
      return <p className="text-center">loading data...</p>;
    }
    return (
      <div className="github-wrapper">
        <ul>
          {this.state.github.map(b => {
            return <li key={b.name}>{b.name}</li>;
          })}
        </ul>
      </div>
    );
  }
}

GitHub.defaultProps = {
  branches: [],
};

GitHub.propTypes = {
  branches: PropTypes.array,
};

export default GitHub;
