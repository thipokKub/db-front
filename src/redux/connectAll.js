import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import rootActions from './actions';
import _ from 'lodash';

export default (ComposedComponent, options) => {
    class EnhancedComponent extends Component {
        render() {
            return (
                <ComposedComponent {...this.props}>
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
    function mapStateToProps(state) {
        if(_.get(options, 'states', []).length !== 0) {
            return _.get(options, 'states', []).reduce((obj, stateName) => {
                if(state[stateName]) {
                    obj[stateName] = state[stateName]
                }
                return obj;
            }, {})
        }
        return { ...state };
    }
    function mapDispatchToProps(dispatch) {
        if (_.get(options, 'actions', []).length !== 0) {
            return bindActionCreators(_.get(options, 'actions', []).reduce((obj, actionName) => {
                if (rootActions[actionName]) {
                    obj[actionName] = rootActions[actionName]
                }
                return obj;
            }, {}), dispatch)
        }
        return bindActionCreators({ ...rootActions }, dispatch);
    }

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent)
}
