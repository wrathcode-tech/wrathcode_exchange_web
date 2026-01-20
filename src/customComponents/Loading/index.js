import React from 'react';
import './Loading.css';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderState: false,
    };
  }

  updateStatus = (status) => {
    this.setState({ loaderState: status });
  };

  render() {
    const { loaderState } = this.state;
    return (
      loaderState && (
        <div className="centerbox">
          <div className="favicon-loader">
            <img src="/images/favicon_light.svg" alt="Loading..." />
          </div>
        </div>
      )
    );
  }
}

export default Loading;
