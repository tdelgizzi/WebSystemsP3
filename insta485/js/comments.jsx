import React from 'react';
import PropTypes from 'prop-types';

class Comments extends React.Component {
  /* Display all the comments from a single post
   */

  constructor(props) {
    // Initialize mutable state
    super(props);
    this.state = { comments: [], text: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
          comments: data.comments,
        });
      })
      .catch((error) => console.log(error));
  }

  handleChange(event) {
    this.setState({ text: event.target.value });
  }

  handleSubmit(event) {
    // submit comment to database
    const { url } = this.props;
    const { comments } = this.state;
    const request = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    };
    fetch(url, request)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        console.log(response);
        return response.json();
      })
      .then((data) => {
        const newComment = {
          commentid: data.commentid,
          owner: data.owner,
          owner_show_url: data.owner_show_url,
          postid: data.postid,
          text: data.text,
        };
        this.setState({ comments: comments.concat(newComment), text: '' });
      })
      .catch((error) => console.log(error));
    event.preventDefault();
  }

  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const { comments, text } = this.state;
    // Render number of post image and post owner
    return (
      <div className="commentdisplay">
        {comments.map((comment) => (
          <div className="comment" key={comment.commentid}>
            <p>
              <span>
                <a href={comment.owner_show_url} className="topright">
                  {comment.owner}
                </a>
              </span>
              {comment.text}
            </p>
          </div>
        ))}
        <div>
          <form onSubmit={this.handleSubmit} className="comment-form">
            <input type="text" value={text} onChange={this.handleChange} />
          </form>
        </div>
      </div>
    );
  }
}

Comments.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Comments;
