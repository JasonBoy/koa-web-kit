import React from 'react';
import 'footer.scss';

export default ({copyright, ...links}) => {
  "use strict";
  return (
    <footer>
      <ul>
        {
          links.map((ele) => {
            return <li><a href={ele.href}>{ele.text}</a></li>
          })
        }
      </ul>
      <p class="text-center">
        {copyright}
      </p>
    </footer>
  );
}