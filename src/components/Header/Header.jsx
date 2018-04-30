import React, { Component } from "react";
import { Navbar } from "react-bootstrap";

import HeaderLinks from "./HeaderLinks.jsx";

import dashboardRoutes from "routes/dashboard.jsx";
import styled from 'styled-components';

const Name = styled.a`
display: inline-flex;
justify-content: center;
align-items: center;
i {
  font-size: 1.5em;
  margin-right: 10px;
  margin-left: 25px;
}
`;

class Header extends Component {
  constructor(props) {
    super(props);
    this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
    this.state = {
      sidebarExists: false
    };
  }
  mobileSidebarToggle(e) {
    if (this.state.sidebarExists === false) {
      this.setState({
        sidebarExists: true
      });
    }
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function() {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  }
  getBrand() {
    var name, icon;
    dashboardRoutes.map((prop, key) => {
      if (prop.collapse) {
        prop.views.map((prop, key) => {
          if (prop.path === this.props.location.pathname) {
            name = prop.name;
            icon = prop.icon;
          }
          return null;
        });
      } else {
        if (prop.redirect) {
          if (prop.path === this.props.location.pathname) {
            name = prop.name;
            icon = prop.icon;
          }
        } else {
          if (prop.path === this.props.location.pathname) {
            name = prop.name;
            icon = prop.icon;
          }
        }
      }
      return null;
    });
    return {name: name, icon: icon};
  }
  render() {
    const prop = this.getBrand();
    return (
      <Navbar fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <Name><i className={prop.icon} />{prop.name}</Name>
          </Navbar.Brand>
          <Navbar.Toggle onClick={this.mobileSidebarToggle} />
        </Navbar.Header>
        <Navbar.Collapse>
          <HeaderLinks />
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
