import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import HeaderLinks from "../Header/HeaderLinks.jsx";

import imagine1 from "assets/img/sidebar-1.jpg";
import imagine2 from "assets/img/sidebar-2.jpg";
import imagine3 from "assets/img/sidebar-3.jpg";
import imagine4 from "assets/img/sidebar-4.jpg";
import logo from "assets/img/Chula_low_poly.png";

import dashboardRoutes from "routes/dashboard.jsx";
import connect from '../../redux/connectAll.js'
import constraint from '../../variables/Constraint';
const { projectName } = constraint;

const ImageArray = [imagine1, imagine2, imagine3, imagine4]

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      index: 3,
    };
  }
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  updateDimensions() {
    this.setState({ width: window.innerWidth });
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }
  render() {
    const { isDisabledMenuItem } = this.props.page;
    return (
      <div
        id="sidebar"
        className="sidebar"
        data-color="blue"
        data-image={ImageArray[this.state.index]}
      >
        <div className="sidebar-background" style={{
          backgroundImage: `url('${ImageArray[this.state.index]}')`
        }} />
        <div className="logo">
          <a
            className="simple-text logo-mini"
          >
            <div className="logo-img">
              <img src={logo} alt="logo_image" />
            </div>
          </a>
          <a
            className="simple-text logo-normal"
          >
            {projectName}
          </a>
        </div>
        <div className="sidebar-wrapper">
          <ul className="nav">
            {this.state.width <= 991 ? <HeaderLinks /> : null}
            {dashboardRoutes.map((prop, key) => {
              if (!prop.redirect) {
                if (isDisabledMenuItem) {
                  if (prop.path.toLowerCase() !== '/login') {
                    return null;
                  }
                  return (
                    <li
                      className="active"
                      key={key}
                    >
                      <NavLink
                        to={prop.path}
                        className="nav-link"
                        activeClassName="active"
                      >
                        <i className={prop.icon} />
                        <p>{prop.name}</p>
                      </NavLink>
                    </li>);
                } else if(!isDisabledMenuItem && prop.path.toLowerCase() === '/login') {
                  return null;
                }
                return (
                  <li
                    className={
                      prop.upgrade
                        ? "active active-pro"
                        : this.activeRoute(prop.path)
                    }
                    key={key}
                  >
                    <NavLink
                      to={prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(Sidebar, {
  states: ["page"],
  actions: []
});
