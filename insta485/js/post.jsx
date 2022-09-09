import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Comments from './comments';
import Likes from './likes';

class Post extends React.Component {
  /* Display a single post
   */

  constructor(props) {
    // Initialize mutable state
    super(props);
    this.state = {
      imgUrl: '',
      owner: '',
      ownerImgUrl: '',
      ownerUrl: '',
      postUrl: '',
      timestamp: '',
    };
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
        this.setState({
          imgUrl: data.img_url,
          owner: data.owner,
          ownerImgUrl: data.owner_img_url,
          ownerUrl: data.owner_show_url,
          postUrl: data.post_show_url,
          timestamp: moment.utc(data.age).fromNow(),
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const {
      imgUrl, owner, ownerImgUrl, ownerUrl, postUrl, timestamp,
    } = this.state;
    const { url, postid } = this.props;
    const commentsUrl = url.concat('comments/');
    const likesUrl = url.concat('likes/');
    // Render number of post image and post owner
    return (
      <div className="post">
        <hr />
        <a href={ownerUrl}>
          <img alt="pic" src={ownerImgUrl} style={{ height: 30, width: 30 }} />
        </a>
        <a href={ownerUrl} className="topright">
          {owner}
        </a>
        <a href={postUrl} className="timestamp">
          {timestamp}
        </a>
        <br />
        <Likes url={likesUrl} postid={postid} imgUrl={imgUrl} />
        <Comments url={commentsUrl} postid={postid} />
      </div>
    );
  }
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
  postid: PropTypes.number.isRequired,
};

export default Post;
