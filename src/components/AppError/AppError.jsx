import React from 'react';
import PropTypes from 'prop-types';

class AppError extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidMount() {}

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    // console.error(error);
    // console.error(info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" role="alert">
          Something went wrong!!!
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppError;
