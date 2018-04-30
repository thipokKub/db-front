import React, { Component } from "react";
import { Grid, Row, Col, Table } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import styled from 'styled-components';
import _ from 'lodash';
import connect from '../../redux/connectAll';

import Loader from '../../components/Loader';
import axios from 'axios';
import constraint from '../../variables/Constraint';
import PropTypes from 'prop-types';
import { getCookie, modObj } from '../../general';
import MaterialInput from '../../components/StyleInput/index';

const { apiUri, timeOutTime } = constraint;

const Title = styled.section`
h1, h2 {
    margin: 0;
}
`;
const Content = styled.section`
box-sizing: border-box;
padding: 10px 40px;
.flex {
    display: flex;

    &.center {
        justify-content: center;
        align-items: center;
    }
}

.div-input {
    flex: 1;
    max-width: initial !important;
    min-width: initial !important;
    width: 100%;
}

.semester-grade {
    h3 {
        margin-bottom: 5px;
    }
    &:not(:last-of-type) {
        margin-bottom: 40px;
        border-bottom: 1px solid #AAAA;
    }
    table {
        background-color: rgba(0, 0, 0, 0.05);
        thead {
            background-color: rgba(0, 0, 0, 0.1);
            border: 1px solid #AAAAAA30;
        }
        td {
            border: 1px solid #AAAAAA30;
        }
        &.top {
            td {
                width: 25%;
            }
        }
        &.bottom {
            background-color: rgba(0, 0, 0, 0.01);
            td {
                width: calc(100%/7);
            }
        }
    }
}

h3 {
    margin-top: 0;
    margin-bottom: 25px;
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
}
`;

const defaultState = (value) => {
    return ({
        text: value,
        isValidate: true,
        warning: '',
        isOnlyWarning: false,
        timeoutId: -1
    });
}

const ProfileKeys = ["SID", "Fname", "Mname", "Lname", "SSN", "Sex", "Bdate", "Email", "Address", "FID", "DID", "CID"]

const initialState = {
    SID: { ...defaultState('') },
    Fname: { ...defaultState('') },
    Mname: { ...defaultState('') },
    Lname: { ...defaultState('') },
    SSN: { ...defaultState('') },
    Sex: { ...defaultState('') },
    Bdate: { ...defaultState(new Date()) },
    Email: {
        ...defaultState(''),
        isOnlyWarning: false
    },
    Address: { ...defaultState('') },
    FID: { ...defaultState('') },
    DID: { ...defaultState('') },
    CID: { ...defaultState('') },
    Grades: [],
    isLoadingProfile: false,
    isLoadingGrade: false,
    status: '',
    isValidating: false,
    GradRequest: {
        status: "No request is present",
        message: ""
    },
    FeeStatus: []
}

const Year = ["2016", "2017"]
const Semester = ["1", "2"]

const InputGenerator = (state, FieldName, label, onChange, props = {}) => {
    return (
        <MaterialInput
            outerClass="div-input"
            label={label}
            value={state[FieldName].text}
            warning={state[FieldName].warning}
            isValidated={state[FieldName].isValidate}
            onChange={onChange(FieldName)}
            required={false}
            {...props}
        />
    );
}

class Profile extends Component {
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

        setTimeout(() => {
            this.getProfile();
            this.getGrade();
        }, 0)
    }

    getProfile = async () => {
        try {
            this.setState({ isLoadingProfile: true, status: 'Loading' })
            let response = await axios.get(`${apiUri}/profile`, {
                headers: {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            response = response.data
            setTimeout(() => {
                this.setState(ProfileKeys.reduce((acc, field) => {
                    if (typeof(response[field]) !== "undefined") {
                        acc[field] = {
                            ...this.state[field],
                            text: response[field],
                            isValidate: true,
                            warning: ''
                        }
                    }
                    return acc;
                }, {
                    isLoadingProfile: false,
                    status: 'Success'
                }))
            }, timeOutTime);

        } catch (e) {
            this.setState({
                ..._.cloneDeep(initialState),
                isLoadingProfile: false,
                status: 'Failed'
            })
        }
    }
    getGrade = async () => {
        try {
            this.setState({
                isLoadingGrade: true
            })
            this.onRequestFeeStatus();

            let response = await axios(`${apiUri}/grade`, {
                headers: {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`
                }
            })
            response = response.data;
            setTimeout(() => {
                this.setState({
                    Grade: response,
                    isLoadingGrade: false
                })
            }, timeOutTime);
        } catch (e) {

        }
    }
    inputShouldUpdateState = (fieldName, text) => {
        let warning = ''
        let result = true;
        switch (fieldName) {
            case 'SID':
            case 'SSN':
            case 'Sex':
            case 'Bdate':
            case 'FID':
            case 'DID':
            case 'CID':
            case 'Fname':
            case 'Mname':
            case 'Lname':
            case 'Email':
            case 'Address':
                result = false;
                warning = 'Cannot modify this field'
                break;
            // case 'Fname':
            // case 'Mname':
            // case 'Lname':
            //     result = !/[0-9]+/.test(text)
            //     if(!result) {
            //         warning = 'Input must not contain any number'
            //     }
            //     break;
            // case 'Email':
            //     result = /^[a-zA-Z]+@[a-zA-Z.]+$/.test(text);
            //     if (!result) {
            //         warning = 'Invalid email address'
            //     }
            //     break;
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
            } else if (_.get(this.state, `${fieldName}.isValidate`) || _.get(this.state, `${fieldName}.isOnlyWarning`, false)) {
                clearTimeout(_.get(this.state, `${fieldName}.timeoutId`));
                this.setState((prevState) => {
                    let mergedObj = modObj(prevState, `${fieldName}.isValidate`, false);
                    mergedObj = modObj(mergedObj, `${fieldName}.warning`, result.warning);
                    mergedObj = modObj(mergedObj, `isValidating`, true);
                    if (_.get(prevState, `${fieldName}.isOnlyWarning`, false)) {
                        mergedObj = modObj(mergedObj, `${fieldName}.text`, value);
                    }
                    mergedObj = modObj(mergedObj, `${fieldName}.timeoutId`,
                        setTimeout(() => {
                            this.setState((prevState) => {
                                let mergedObj = modObj(prevState, `${fieldName}.isValidate`, true);
                                mergedObj = modObj(mergedObj, `${fieldName}.warning`, '');
                                mergedObj = modObj(mergedObj, `isValidating`, false);
                                mergedObj = modObj(mergedObj, `${fieldName}.timeoutId`, -1);
                                return mergedObj === null ? prevState : mergedObj;
                            })
                        }, timeOutTime)
                    )
                    return mergedObj === null ? prevState : mergedObj;
                }, () => {
                    
                })
            }
        }
    }
    onRequestFeeStatus = async () => {
        try {
            let results = await Promise.all(Year.slice().reverse().reduce((acc, year) => {
                return acc.concat(
                    Semester.slice().reverse().map(async (sem) => {
                        try {
                            const r = await axios.get(`${ apiUri }/register/fee?FYear=${year}&FSemester=${sem}`, {
                                headers: {
                                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`
                                }
                            });
                            return {
                                semester: sem,
                                year: year,
                                data: r.data
                            };
                        } catch (e) {
                            return JSON.parse(JSON.stringify(e));
                        }
                    })
                );
            }, []))
            this.setState({
                FeeStatus: results
            })
        } catch (e) {

        }
    }
    onRequestGrad = async () => {
        try {
            let response = await axios.get(`${apiUri }/request/grad`, {
                headers: {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`
                }
            })
            response = response.data;
            if(response.status !== 1) {
                this.setState({
                    GradRequest: {
                        status: "Failed",
                        message: response.message
                    }
                })
            } else {
                this.setState({
                    GradRequest: {
                        status: "Success",
                        message: "Your request are now submitted for consideration"
                    }
                })
            }
        } catch(e) {

        }
    }
    render() {
        const s = this.state;
        const { isLoadingProfile, isLoadingGrade, Grade } = this.state;
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <Title>
                                        <h2>Profile</h2>
                                    </Title>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <Content>
                                        <form>
                                            {isLoadingProfile && (
                                                <div className="isDisabled">
                                                    <Loader style={{
                                                        transform: 'scale(1.2)'
                                                    }} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex">
                                                    { InputGenerator(s, "SID", "Student ID", this.onInputTextChangeState) }
                                                    { InputGenerator(s, "SSN", "Citizen ID", this.onInputTextChangeState) }
                                                </div>
                                                <div className="flex">
                                                    { InputGenerator(s, "Sex", "Gender", this.onInputTextChangeState) }
                                                    { InputGenerator(s, "FID", "Faculty ID", this.onInputTextChangeState) }
                                                    { InputGenerator(s, "DID", "Department ID", this.onInputTextChangeState) }
                                                    { InputGenerator(s, "CID", "CID", this.onInputTextChangeState) }
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex">
                                                    { InputGenerator(s, "Fname", "First Name", this.onInputTextChangeState) }
                                                    { InputGenerator(s, "Mname", "Middle Name", this.onInputTextChangeState) }
                                                    { InputGenerator(s, "Lname", "Last Name", this.onInputTextChangeState) }
                                                </div>
                                                <div className="flex">
                                                    { InputGenerator(s, "Address", "Address", this.onInputTextChangeState) }
                                                </div>
                                                <div className="flex">
                                                    { InputGenerator(s, "Email", "Email Address", this.onInputTextChangeState) }
                                                </div>
                                            </div>
                                        </form>
                                    </Content>
                                }
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <Title>
                                        <h2>Grade</h2>
                                    </Title>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <Content>
                                        <form>
                                            {isLoadingGrade && (
                                                <div className="isDisabled">
                                                    <Loader style={{
                                                        transform: 'scale(1.2)'
                                                    }} />
                                                </div>
                                            )}
                                            {
                                               (Grade || []).map((item, idx) => {
                                                   return (
                                                        <div className="semester-grade" key={idx}>
                                                            <h3>{item.Semester}</h3>
                                                            <Table striped hover className="top">
                                                                <thead>
                                                                    <tr>
                                                                        <td>Course ID</td>
                                                                        <td>Course Name</td>
                                                                        <td>Credits</td>
                                                                        <td>Grade</td>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        item.Subjects.map((it, idx) => {
                                                                            return (
                                                                                <tr key={idx}>
                                                                                    <td>{it.ID}</td>
                                                                                    <td>{it.Name}</td>
                                                                                    <td>{it.Credit}</td>
                                                                                    <td>{it.Grade}</td>
                                                                                </tr>
                                                                            );
                                                                        })
                                                                    }
                                                                </tbody>
                                                            </Table>
                                                           <Table striped hover className="bottom">
                                                                <thead>
                                                                    <tr>
                                                                        <td>CA</td>
                                                                        <td>CG</td>
                                                                        <td>GPA</td>
                                                                        <td>CAX</td>
                                                                        <td>CGX</td>
                                                                        <td>GPAX</td>
                                                                        <td>GPX</td>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                       <td>{item.CA}</td>
                                                                       <td>{item.CG}</td>
                                                                       <td>{item.GPA}</td>
                                                                       <td>{item.CAX}</td>
                                                                       <td>{item.CGX}</td>
                                                                       <td>{item.GPAX}</td>
                                                                       <td>{item.GPX}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                   );
                                               })
                                            }
                                        </form>
                                    </Content>
                                }
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <Title>
                                        <h2>Fee Status</h2>
                                    </Title>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <Content>
                                        <form>
                                            {isLoadingGrade && (
                                                <div className="isDisabled">
                                                    <Loader style={{
                                                        transform: 'scale(1.2)'
                                                    }} />
                                                </div>
                                            )}
                                            <Table striped hover className="top">
                                                <thead>
                                                    <tr>
                                                        <td>Year</td>
                                                        <td>Semester</td>
                                                        <td>Status</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        s.FeeStatus.map((item, key) => {
                                                            return (
                                                                <tr key={key}>
                                                                    <td>{item.year}</td>
                                                                    <td>{item.semester}</td>
                                                                    <td>{item.data.status !== 1 ? 'Not Paid': 'Paid'}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                        </form>
                                    </Content>
                                }
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <Title>
                                        <h2>Request graduation</h2>
                                    </Title>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <Content>
                                        <form>
                                            {isLoadingGrade && (
                                                <div className="isDisabled">
                                                    <Loader style={{
                                                        transform: 'scale(1.2)'
                                                    }} />
                                                </div>
                                            )}
                                            <div>
                                                <span>Request Graduation</span>
                                                <button onClick={this.onRequestGrad} type="button">Yes, please!</button>
                                            </div>
                                            <div>
                                                <div>Status: {s.GradRequest.status}</div>
                                                <div>Message: {s.GradRequest.message}</div>
                                            </div>
                                        </form>
                                    </Content>
                                }
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default connect(Profile);
