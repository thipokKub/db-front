import React, { Component } from "react";
import { Nav, NavDropdown, MenuItem } from "react-bootstrap";
import connect from '../../redux/connectAll';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getCookie } from '../../general';
import constrant from '../../variables/Constraint';
import styled from 'styled-components';

const { apiUri } = constrant;
const IconDropdown = styled.div`
display: flex;
justify-content: center;
align-items: center;
height: 2.2rem;
i {
  font-size: 3rem !important;
}
.notification, .fa.fa-globe {
  transform: translateX(-10px)
}

@media screen and (max-width: 991px) {
  justify-content: flex-start;
  align-items: center;
  .notification, .fa.fa-globe {
    transform: translateX(0px)
  }
}
`

class HeaderLinks extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }).isRequired,
      staticContext: PropTypes.object
    }).isRequired
  }
  onClickProfile = () => {
    this.context.router.history.push('/profile')
  }
  onClickLogout = async () => {
    try {
      await axios.get(`${ apiUri }/logout`, {
        "headers": {
          "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
        }
      })
      this.props.resetLoginValue();
      this.context.router.history.push('/')
    }
    catch(e) {
      console.log(e)
    }
  }
  render() {
    const { isDisabledMenuItem } = this.props.page;

    if (isDisabledMenuItem) {
      return null;
    }
    
    // const notification = (
    //   <IconDropdown>
    //     <i className="fa fa-globe" />
    //     <b className="caret" />
    //     {
    //       // <span className="notification">5</span>
    //     }
    //     <p className="hidden-lg hidden-md">Notification</p>
    //   </IconDropdown>
    // );

    return (
      <div>
        <Nav pullRight>
          {
            // <NavDropdown
            //   eventKey={2}
            //   title={notification}
            //   noCaret
            //   id="basic-nav-dropdown"
            // >
            //   <MenuItem eventKey={2.1}>Notification 1</MenuItem>
            //   <MenuItem eventKey={2.2}>Notification 2</MenuItem>
            //   <MenuItem eventKey={2.3}>Notification 3</MenuItem>
            //   <MenuItem eventKey={2.4}>Notification 4</MenuItem>
            //   <MenuItem eventKey={2.5}>Another notifications</MenuItem>
            // </NavDropdown>
          }
          <NavDropdown
            eventKey={2}
            title={
              <IconDropdown>
                <i className="pe-7s-user" />
                <b className="caret" />
                <p className="hidden-lg hidden-md">User</p>
              </IconDropdown>
            }
            id="basic-nav-dropdown-right"
            noCaret
          >
            <MenuItem eventKey={2.1} onClick={this.onClickProfile}>View profile</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={2.5} onClick={this.onClickLogout}>Log out</MenuItem>
          </NavDropdown>
        </Nav>
      </div>
    );
  }
}

export default connect(HeaderLinks, {
  states: ['page'],
  actions: ["resetLoginValue"]
});
