import React from 'react';

class AppError extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      info: null,
    };
  }

  componentDidMount() {}

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
  }

  reload = (e) => {
    e.preventDefault();
    location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger text-center" role="alert">
          Something went wrong!!!
          <a className="ml-2" href="#" onClick={this.reload}>
            Reload
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppError;
