import React from 'react';
import ReactDOM from 'react-dom';
import Feed from './feed';

// This method is only called once
ReactDOM.render(
  // Insert the post component into the DOM
  <Feed url="/api/v1/p/" />,
  document.getElementById('reactEntry'),
);
