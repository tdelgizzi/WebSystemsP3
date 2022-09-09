import React from 'react';
import PropTypes from 'prop-types';

class Likes extends React.Component {
  /* Display all the likes from a single post
   */

  constructor(props) {
    // Initialize mutable state
    super(props);
    this.state = {
      likesCount: 0,
      lognameLikesThis: 0,
      buttonString: 'like',
      likesString: 'likes',
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
  }

  componentDidMount() {
    // This line automatically assigns this.props.url to the const variable url
    const { url } = this.props;
    // Call REST API to get the post's information
    fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        let buttonStr = 'like';
        let likesStr = 'likes';
        if (data.logname_likes_this === 1) {
          buttonStr = 'unlike';
        }
        if (data.likes_count === 1) {
          likesStr = 'like';
        }
        this.setState({
          likesCount: data.likes_count,
          lognameLikesThis: data.logname_likes_this,
          likesString: likesStr,
          buttonString: buttonStr,
        });
      })
      .catch((error) => console.log(error));
  }

  handleClick(event) {
    const { url } = this.props;
    const { likesCount, buttonString } = this.state;
    let newLikes = likesCount - 1;
    let newLognameLikesThis = 0;
    let newLikesString = 'likes';
    let newButtonString = 'like';
    let request = {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    };
    if (buttonString === 'like') {
      newLikes = likesCount + 1;
      newLognameLikesThis = 1;
      newButtonString = 'unlike';
      request = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      };
    }
    if (newLikes === 1) {
      newLikesString = 'like';
    }
    fetch(url, request)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        this.setState({
          likesCount: newLikes,
          lognameLikesThis: newLognameLikesThis,
          likesString: newLikesString,
          buttonString: newButtonString,
        });
        return response.json();
      })
      .catch((error) => console.log(error));
    event.preventDefault();
  }

  handleDoubleClick(event) {
    const { url } = this.props;
    const { likesCount, lognameLikesThis } = this.state;
    // if already liked, then don't do anything
    // if not liked, change button state
    if (lognameLikesThis === 0) {
      const newLikes = likesCount + 1;
      const newLognameLikesThis = 1;
      const newButtonString = 'unlike';
      const request = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      };
      let newLikesString = 'likes';
      if (newLikes === 1) {
        newLikesString = 'like';
      }
      fetch(url, request)
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          this.setState({
            likesCount: newLikes,
            lognameLikesThis: newLognameLikesThis,
            likesString: newLikesString,
            buttonString: newButtonString,
          });
          return response.json();
        })
        .catch((error) => console.log(error));
    }
    event.preventDefault();
  }

  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const { likesCount, buttonString, likesString } = this.state;
    const { imgUrl } = this.props;
    const printLine = `${likesCount} ${likesString}`;
    // Render number of post image and post owner
    return (
      <div className="likes">
        <img src={imgUrl} onDoubleClick={this.handleDoubleClick} alt="pic" />
        <br />
        <button type="button" className="like-unlike-button" onClick={this.handleClick}>
          {buttonString}
        </button>
        <p>
          {printLine}
        </p>
      </div>
    );
  }
}

Likes.propTypes = {
  url: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired,
};

export default Likes;
