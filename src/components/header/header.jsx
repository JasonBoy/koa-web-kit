import React from 'react';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
import './header.scss';

class Header extends React.Component {
  constructor(props){
    super(props);
    this.state= {
      nav: [
        {
          name: 'Home',
          url: '/'
        },
        {
          name: 'About',
          url: '/about'
        }
      ]
    };
  }
  render() {
    return (
      <header>
        <p>NIHAO</p>
        <ul>
          {
            this.state.nav.map((item, index) => {
              return <li key={index}><a className="link" href={item.url}>{item.name}</a></li>;
            })
          }
        </ul>
      </header>
    );
  }
}

// export default withStyles(s)(Header);
export default Header;