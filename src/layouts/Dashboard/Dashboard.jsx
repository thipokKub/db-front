import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import NotificationSystem from "react-notification-system";

import Header from "components/Header/Header";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";

import { style } from "variables/Variables.jsx";

import dashboardRoutes from "routes/dashboard.jsx";
import connectAll from '../../redux/connectAll';
import { getCookie } from '../../general';
import PropTypes from 'prop-types';
import _ from 'lodash';

class Dashboard extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired
      }).isRequired,
      staticContext: PropTypes.object
    }).isRequired
  }
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleNotificationClick = this.handleNotificationClick.bind(this);
    this.state = {
      _notificationSystem: null
    };
  }
  handleNotificationClick(position) {
    // var color = Math.floor(Math.random() * 4 + 1);
    // var level;
    // switch (color) {
    //   case 1:
    //     level = "success";
    //     break;
    //   case 2:
    //     level = "warning";
    //     break;
    //   case 3:
    //     level = "error";
    //     break;
    //   case 4:
    //     level = "info";
    //     break;
    //   default:
    //     break;
    // }
    // this.state._notificationSystem.addNotification({
    //   title: <span data-notify="icon" className="pe-7s-gift" />,
    //   message: (
    //     <div>
    //       Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for
    //       every web developer.
    //     </div>
    //   ),
    //   level: level,
    //   position: position,
    //   autoDismiss: 15
    // });
  }
  checkIsLogin = (location) => {
    if (location.pathname.toLowerCase() === "/login" ||
      location.pathname.toLowerCase() === "/") {
      if(!this.props.page.isDisabledMenuItem) {
        this.props.disableMenuItem()
      }
    } else {
      if(this.props.page.isDisabledMenuItem) {
        this.props.enableMenuItem()
      }
      if (_.get(this.props, 'page.token', '').length === 0 && getCookie("token").length === 0) {
        setTimeout(() => {
          this.context.router.history.push('/')
        }, 200);
      }
    }

    if(this.props.page.token.length === 0) {
      const token = getCookie("token");
      let info = getCookie("info")
      if(info.length > 0) {
        info = JSON.parse(info)
        this.props.setLoginValue({
          ...info,
          token: token
        })
      }
    }
  }

  componentDidMount() {
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    const { listen } = this.props.history;
    this.checkIsLogin(this.props.location)
    listen((location) => {
      this.checkIsLogin(location)
    })
    // var _notificationSystem = this.refs.notificationSystem;
    // var color = Math.floor(Math.random() * 4 + 1);
    // var level;
    // switch (color) {
    //   case 1:
    //     level = "success";
    //     break;
    //   case 2:
    //     level = "warning";
    //     break;
    //   case 3:
    //     level = "error";
    //     break;
    //   case 4:
    //     level = "info";
    //     break;
    //   default:
    //     break;
    // }
    // _notificationSystem.addNotification({
    //   title: <span data-notify="icon" className="pe-7s-gift" />,
    //   message: (
    //     <div>
    //       Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for
    //       every web developer.
    //     </div>
    //   ),
    //   level: level,
    //   position: "tr",
    //   autoDismiss: 15
    // });
  }
  componentDidUpdate(e) {
    if (
      window.innerWidth < 993 &&
      e.history.location.pathname !== e.location.pathname &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }
  }
  
  render() {
    return (
      <div className="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <Sidebar {...this.props} />
        <div id="main-panel" className="main-panel" ref="mainPanel">
          <Header {...this.props} />
          <Switch>
            {dashboardRoutes.map((prop, key) => {
              if (prop.name === "Notifications")
                return (
                  <Route
                    path={prop.path}
                    key={key}
                    render={routeProps => (
                      <prop.component
                        {...routeProps}
                        handleClick={this.handleNotificationClick}
                      />
                    )}
                  />
                );
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.to} key={key} />;
              return (
                <Route path={prop.path} component={prop.component} key={key} />
              );
            })}
          </Switch>
          <Footer />
        </div>
      </div>
    );
  }
}

export default connectAll(Dashboard, {
  states: ["page"],
  actions: ["disableMenuItem", "enableMenuItem", "setLoginValue"]
});
