import React, {Component} from 'react';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Badge from 'material-ui/Badge';
import './Header.scss';

const styles = {
  badge: {
    float: 'right',
    padding: '15px 15px 5px 12px',
    marginTop: '5px',
  }
};

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
      <header className="app-header clearfix">
        <a className="logo" href="#">
          Home LOGO
        </a>

        <div className="menu-wrapper">
          <ul className="menu">
            {
              this.state.nav.map((item, index) => {
                return (
                  <li key={index}>
                    <a className="link" href={item.url}>{item.name}</a>
                    {/*<FlatButton label={item.name} secondary={true} href={"#"}*/}
                                {/*backgroundColor="transparent"*/}
                    {/*/>*/}
                  </li>
                );
              })
            }
          </ul>
        </div>
        <Badge
          badgeContent={4}
          primary={true}
          style={styles.badge}
        >
          <NotificationsIcon />
        </Badge>

      </header>

    );
  }
}

// export default withStyles(s)(Header);
export default Header;