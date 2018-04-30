import React, { Component } from "react";
import { Grid } from "react-bootstrap";
import constraint from '../../variables/Constraint';
const { projectName } = constraint;

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <Grid fluid>
          <nav className="pull-left">
            
          </nav>
          <p className="copyright pull-right">
            &copy; {new Date().getFullYear()}{" "}
            <a>{projectName}</a>
          </p>
        </Grid>
      </footer>
    );
  }
}

export default Footer;
