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
    const isDarkTheme = document.body.classList.contains('dark');
    return (
      loaderState && (
        <div className="centerbox">
          {isDarkTheme ? (
            <img className="lightlogo" src="/images/logo_dark.svg" alt="logo" />
          ) : (
            <img className="darklogo" src="/images/logo_light.svg" alt="logo" />
          )}
        </div>
      )
    );
  }
}

export default Loading;
