import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './post';

class Feed extends React.Component {
  /* Display a feed of posts
   */

  constructor(props) {
    // Initialize mutable state
    super(props);
    const { url } = this.props;
    const propUrl = url;
    this.state = { url: propUrl, next: '', results: [] };
    this.fetchMoreData = this.fetchMoreData.bind(this);
  }

  componentDidMount() {
    if (performance.getEntriesByType('navigation')[0].type !== 'back_forward') {
      // This line automatically assigns this.state.url to the const variable url
      const { url } = this.state;
      // Call REST API to get the post's information
      fetch(url, { credentials: 'same-origin' })
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          return response.json();
        })
        .then((data) => {
          this.setState({
            next: data.next,
            results: data.results,
          });
          window.history.pushState(this.state, '', '');
        })
        .catch((error) => console.log(error));
    } else {
      this.setState(window.history.state);
    }
  }

  fetchMoreData() {
    const { next, results } = this.state;
    if (next !== '') {
      fetch(next, { credentials: 'same-origin' })
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          return response.json();
        })
        .then((data) => {
          this.setState({
            next: data.next,
            results: results.concat(data.results),
          });
        })
        .catch((error) => console.log(error));
    }
  }

  render() {
    const { results } = this.state;
    return (
      <div className="feed">
        <InfiniteScroll dataLength={results.length} next={this.fetchMoreData} hasMore="true" endMessage={<h4>No more!</h4>}>
          {results.map((post) => (
            <div key={post.postid}>
              <Post url={post.url} postid={post.postid} />
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  }
}

Feed.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Feed;
