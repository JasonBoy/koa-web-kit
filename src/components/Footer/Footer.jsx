import React from 'react';
import './Footer.scss';

export default ({copyright, links}) => {
  'use strict';
  return (
    <footer>
      <ul>
        {
          links.map((ele) => {
            return <li key={ele.id}><a href={ele.href}>{ele.text}</a></li>;
          })
        }
      </ul>
      <p className="text-center">
        {copyright}
      </p>
    </footer>
  );
};