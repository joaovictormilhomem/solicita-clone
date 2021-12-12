import React from 'react';
import './Loading.css';

function Loading(props) {

  return (
    <div className={props.className}>
      <div className="loading"></div>
    </div>
  );
}

export default Loading;