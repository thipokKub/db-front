import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import styled from 'styled-components';
import MaterialInput from '../../components/StyleInput/index';
import FakeCapcha from '../../assets/img/capcha.png';
import _ from 'lodash';
import connect from '../../redux/connectAll';
import Loader from '../../components/Loader';
import axios from 'axios';
import constraint from '../../variables/Constraint';
import { modObj, setCookie } from '../../general';
import PropTypes from 'prop-types';
const { apiUri, timeOutTime } = constraint;

const LoginTitle = styled.section`
`;
const LoginContent = styled.section`
display: flex;
justify-content: center;
align-items: center;
transition: all 0.2s ease-in-out;
position: relative;
div.center {
    display: flex;
    align-items: center;
    justify-content: center;
}
form {
    .isDisabled {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        z-index: 2000;
        top: -10px;
        left: 0;
        width: 100%;
        height: calc(100% + 10px);
        background: #FFF7;
    }
    .fake-capcha {
        display: flex;
        justify-content: center;
        align-items: center;
        > * {
            margin-left: 5px;
            margin-right: 5px;
        }
        p {
            width: 52px;
            img {
                width: 100%;
            }
        }
        /* flex-direction: column; */
    }
}
`;

const initialState = {
    userName: {
        text: '',
        isValidate: true,
        warning: ''
    },
    password: {
        text: '',
        isValidate: true,
        warning: ''
    },
    capcha: {
        text: '',
        isValidate: true,
        warning: ''
    },
    isValidating: false,
    isRequesting: false,
    status: ''
}

const InputSetting = {
    highlightColor: '#3767ED',
    activeColor: '#3767ED',
    fontColor: '#999',
    fontSize: '15px'
}

class Login extends Component {
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
        this.state = _.cloneDeep(initialState)
    }
    inputShouldUpdateState = (fieldName, text) => {
        let warning = ''
        let result = false;
        switch(fieldName) {
            case 'userName':
                if(text.length > 10) {
                    warning = 'Input must be exactly 10 digits'
                } else if (!(/^[0-9]*$/.test(text))) {
                    warning = 'Input must contain only 0-9'
                }
                result = text.length <= 10 && /^[0-9]*$/.test(text)
                break;
            case 'password':
                if(text.length > 16) {
                    warning = 'Input must be 16 characters or less'
                }
                result = text.length <= 16
                break;
            case 'capcha':
                if (text.length > 4) {
                    warning = 'Input must be exactly 4 characters'
                }
                result = text.length <= 4;
                break;
            default:
        }
        return ({
            result,
            warning
        });
    }
    onInputTextChangeState = (fieldName, isUseEvent = true) => {
        return (e) => {
            const value = isUseEvent ? e.target.value : e;
            const result = this.inputShouldUpdateState(fieldName, value);
            if (result.result) {
                this.setState((prevState) => {
                    let mergedObj = modObj(prevState, `${fieldName}.text`, value);
                    mergedObj = modObj(mergedObj, `${fieldName}.isValidate`, true);
                    mergedObj = modObj(mergedObj, `${fieldName}.warning`, '');
                    return mergedObj === null ? prevState : mergedObj;
                })
            } else if(_.get(this.state, `${fieldName}.isValidate`)) {
                this.setState((prevState) => {
                    let mergedObj = modObj(prevState, `${fieldName}.isValidate`, false);
                    mergedObj = modObj(mergedObj, `${fieldName}.warning`, result.warning);
                    mergedObj = modObj(mergedObj, `isValidating`, true);
                    return mergedObj === null ? prevState : mergedObj;
                }, () => {
                    setTimeout(() => {
                        this.setState((prevState) => {
                            let mergedObj = modObj(prevState, `${fieldName}.isValidate`, true);
                            mergedObj = modObj(mergedObj, `${fieldName}.warning`, '');
                            mergedObj = modObj(mergedObj, `isValidating`, false);
                            return mergedObj === null ? prevState : mergedObj;
                        })
                    }, timeOutTime);
                })
            }
        }
    }
    onSubmit = async (e) => {
        e.preventDefault();
        let { userName, password, capcha, isValidating } = _.cloneDeep(this.state);
        let affectedField = []
        if(!isValidating) {
            if(userName.text.length !== 10) {
                userName.isValidate = false;
                affectedField.push('userName');
                userName.warning = 'Input must contain exactly 10 digit';
            }
            if(password.text.length <= 0) {
                password.isValidate = false;
                affectedField.push('password');
                userName.warning = 'Input must contain al least 1 character';
            }
            if(capcha.text !== 'X136') {
                capcha.isValidate = false;
                affectedField.push('capcha');
                capcha.warning = 'Incorrect capcha';
            }
            if (affectedField.length !== 0) {
                this.setState({
                    userName,
                    password,
                    capcha,
                    isValidating: true
                }, () => {
                    setTimeout(() => {
                        this.setState((prevState) => {
                            let mergedObj = _.cloneDeep(prevState);
                            affectedField.forEach((fieldName) => {
                                mergedObj = modObj(prevState, `${fieldName}.isValidate`, true);
                                mergedObj = modObj(mergedObj, `${fieldName}.warning`, '');
                            })
                            mergedObj = modObj(mergedObj, `isValidating`, false);
                            return mergedObj === null ? prevState : mergedObj;
                        })
                    }, timeOutTime)
                })
            } else {
                try {
                    this.setState({ isRequesting: true })
                    let response = await axios.post(`${apiUri}/login`, {
                        "SID": userName.text,
                        "password": password.text
                    })
                    response = response.data;
                    
                    setTimeout(() => {
                        if (response.status !== 1) {
                            this.setState({
                                status: 'Login Failed',
                                isRequesting: false
                            })
                        } else {
                            const { token, ...rest } = response;
                            setCookie({
                                'name': 'token',
                                'hours': 3,
                                'value': token
                            })
                            setCookie({
                                'name': 'info',
                                'hours': 3,
                                'value': JSON.stringify(rest)
                            })
                            this.props.setLoginValue(response)
                            this.setState({
                                status: 'Login Success',
                                isRequesting: false
                            }, () => {
                                this.context.router.history.push('/announcement')
                            })
                        }
                    }, 1000)
                } catch(e) {
                    this.setState({
                        status: 'Login Failed',
                        isRequesting: false
                    })
                }
            }
        }
        return false;
    }
    onReset = () => {
        this.setState(_.cloneDeep(initialState))
    }
    render() {
        const { userName, password, capcha, isRequesting, status } = this.state;
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <LoginTitle>
                                        Login
                                    </LoginTitle>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <LoginContent
                                        isDisabled={isRequesting}
                                    >
                                        <form
                                            onSubmit={this.onSubmit}
                                        >
                                            {isRequesting && (
                                                <div className="isDisabled">
                                                    <Loader style={{
                                                        transform: 'scale(1.2)'
                                                    }}/>
                                                </div>
                                            )}
                                            <MaterialInput
                                                label='Username'
                                                width="100%"
                                                {...InputSetting}
                                                onChange={this.onInputTextChangeState('userName')}
                                                value={userName.text}
                                                isValidated={userName.isValidate}
                                                warning={userName.warning}
                                            />
                                            <MaterialInput
                                                label='Password'
                                                width="100%"
                                                {...InputSetting}
                                                type='password'
                                                onChange={this.onInputTextChangeState('password')}
                                                value={password.text}
                                                isValidated={password.isValidate}
                                                warning={password.warning}
                                            />
                                            <div className="fake-capcha">
                                                <p>
                                                    <img src={FakeCapcha} alt="fake-capcha" />
                                                </p>
                                                <MaterialInput
                                                    label='Capcha'
                                                    width="calc(100% - 100px) !important"
                                                    {...InputSetting}
                                                    onChange={this.onInputTextChangeState('capcha')}
                                                    value={capcha.text}
                                                    isValidated={capcha.isValidate}
                                                    warning={capcha.warning}
                                                />
                                            </div>
                                            <div className="center" style={{ color: status === "Login Success" ? 'green' : 'red'}}>
                                                {status}
                                            </div>
                                            <div className="center">
                                                <button type="submit">Submit</button>
                                                <button type="reset" onClick={this.onReset}>Cancel</button>
                                            </div>
                                        </form>
                                    </LoginContent>
                                }
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default connect(Login);
