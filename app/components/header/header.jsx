import React from 'react';
import 'header.scss';

export default class Header extends React.Component {
  constructor(props){
    super(props);
    this.state= [
      {
        name: 'Home',
        url: '/'
      },
      {
        name: 'About',
        url: '/about'
      }
    ];
  }
  render() {
    return (
      <header>
        <ul>
          {
            this.state.map((item) => {
              return <li><a href={item.url}>{item.name}</a></li>;
            })
          }
        </ul>
      </header>
    );
  }
};