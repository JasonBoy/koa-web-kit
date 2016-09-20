import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
import './Header.scss';
// import 'content/img/node.png';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
        <RaisedButton label="Default" />
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