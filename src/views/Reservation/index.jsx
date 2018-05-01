import React, { Component } from "react";
import { Grid, Row, Col, Table } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import styled from 'styled-components';
import MaterialInput from '../../components/StyleInput/index';
import _ from 'lodash';
import connect from '../../redux/connectAll';
import Loader from '../../components/Loader';
import axios from 'axios';
import constraint from '../../variables/Constraint';
import { modObj, getCookie } from '../../general';
import PropTypes from 'prop-types';
import DateTime from 'react-datetime';
import moment from 'moment';

const { apiUri, timeOutTime } = constraint;

const Title = styled.section`
`;
const Content = styled.section`
form {
    display: flex;
    flex-direction: column;
    padding: 0px 20px;

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

    &.Reserve {
        padding: 10px 20px;

        &> div {
            &:first-child {
                display: flex;
            }
            &:last-of-type {
                display: flex;
                & > div:first-child {
                    max-width: 70%;
                    display: flex;
                    flex: 1;
                }
                & > div:last-of-type {
                    flex: 1;
                    max-width: 30%;
                    display: flex;
                    align-items: flex-end;
                    justify-content: flex-end;
                    padding-right: 20px;
                }
            }
        }
    }
}
`;

const initialState = {
    BuildID: {
        text: '',
        isValidate: true,
        warning: ''
    },
    RoomID: {
        text: '',
        isValidate: true,
        warning: ''
    },
    StartTime: {
        text: '',
        isValidate: true,
        warning: ''
    },
    FinishTime: {
        text: '',
        isValidate: true,
        warning: ''
    },
    Objective: {
        text: '',
        isValidate: true,
        warning: ''
    },
    isValidating: false,
    isRequesting: false,
    status: '',
    isClearing: false,
    Results: [],
    ReserveStatus: {
        status: -1,
        message: ''
    }
}

const InputSetting = {
    highlightColor: '#3767ED',
    activeColor: '#3767ED',
    fontColor: '#999',
    fontSize: '15px'
}

const DateTimeWrapper = styled.div`
.rdt {
    padding: 10px;
    /* border: 1px solid #0007; */
    display: inline-block;

    &.rdtOpen > .rdtPicker {
        display: flex;
    }

    .rdtTime {
        .rdtCounters {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .rdtCounter {
            width: 30px;
        }

        td {
            width: auto !important;
        }
    }

    .rdtPicker {
        display: none;
        justify-content: center;
        align-items: center;
        text-align: center;

        * {
            text-align: center;
        }

        th, td {
            box-sizing: border-box;
            padding: 5px;
            height: 15px;
            width: 15px;
        }

        .rdtDays {
            tfoot {
                &:hover {
                     background-color: rgba(0, 0, 0, 0.15);
                }
                &:active {
                    background-color: #FF504399;
                }
            }
        }

        .rdtDay {
            &:hover {
                background-color: rgba(0, 0, 0, 0.15);
            }

            &:active {
                background-color: #FF504399;
            }
        }

        .rdtToday {
            background-color: rgba(0, 0, 0, 0.1);
        }

        .rdtNew, .rdtOld {
            color: #999;
        }
    }
}
`;

class Reservation extends Component {
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
        switch (fieldName) {
            case 'BuildID':
            case 'RoomID':
                if (!(/^[0-9]*$/.test(text))) {
                    warning = 'Input must contain only 0-9'
                }
                result = /^[0-9]*$/.test(text)
                break;
            case 'Objective':
            case 'StartTime':
            case 'FinishTime':
                result = true;
                warning = '';
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
            } else if (_.get(this.state, `${fieldName}.isValidate`)) {
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
        return false;
    }
    onSearch = async () => {
        try {
            const response = await axios.post(`${ apiUri }/room/table`, {
                "BuildID": this.state.BuildID.text,
                "RoomID": this.state.RoomID.text,
                "StartTime": moment(this.state.StartTime.text).local("th").format("YYYY-MM-DD HH:mm:ss"),
                "FinishTime": moment(this.state.FinishTime.text).local("th").format("YYYY-MM-DD HH:mm:ss")
            }, {
                "headers": {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            });
            this.setState({
                Results: response.data
            })
        } catch (e) {
            console.log(e)
        }
    }
    onReserve = async () => {
        try {
            const response = await axios.post(`${apiUri}/room/reserve`, {
                "BuildID": this.state.BuildID.text,
                "RoomID": this.state.RoomID.text,
                "StartTime": moment(this.state.StartTime.text).local("th").format("YYYY-MM-DD HH:mm:ss"),
                "FinishTime": moment(this.state.FinishTime.text).local("th").format("YYYY-MM-DD HH:mm:ss"),
                "Objective": this.state.Objective.text
            }, {
                "headers": {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            });
            this.setState({
                ReserveStatus: response.data,
                Results: []
            }, () => {
                // this.onReset();
            })
        } catch (e) {
            console.log(e)
        }
    }
    onReset = () => {
        this.setState(_.cloneDeep(initialState))
        if(this._StartTime_clear) {
            this._StartTime_clear()
        }
        if(this._FinishTime_clear) {
            this._FinishTime_clear()
        }
    }
    onGenerateInput = (fieldName, label, props = {}) => {
        return (
            <MaterialInput
                {...props}
                label={label}
                {...InputSetting}
                onChange={this.onInputTextChangeState(fieldName)}
                value={_.get(this.state, `${fieldName}.text`, '')}
                isValidated={_.get(this.state, `${fieldName}.isValidate`, true)}
                warning={_.get(this.state, `${fieldName}.warning`, '')}
            />
        );
    }
    onGenerateDate = (fieldName, label) => {
        return (
            <DateTimeWrapper>
                <DateTime
                    onChange={(e) => {
                        if(typeof e.toDate === "function") {
                            this.onInputTextChangeState(fieldName, false)(e.toDate())
                        }
                    }}
                    renderInput={(props, openCalendar, closeCalendar) => {
                        function clear() {
                            props.onChange({ target: { value: '' } });
                        }
                        function set(value) {
                            props.onChange({ target: { value: value } });
                        }
                        this[`_${fieldName}_clear`] = clear;
                        this[`_${fieldName}_set`] = set;
                        return (
                            <div>
                                <input {...props} placeholder={label} />
                                <button type="button" onClick={openCalendar}>open calendar</button>
                                <button type="button" onClick={closeCalendar}>close calendar</button>
                                <button type="button" onClick={clear}>clear</button>
                            </div>
                        );
                    }}
                    locale="th"
                />
            </DateTimeWrapper>
        );
    }
    render() {
        const { isRequesting } = this.state;
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <Title>
                                        Reservation
                                    </Title>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <Content>
                                        <form
                                            onSubmit={this.onSubmit}
                                            className="Reserve"
                                        >
                                            <div>
                                                {this.onGenerateInput('BuildID', 'Building Id', {
                                                    width: '50%'
                                                })}
                                                {this.onGenerateInput('RoomID', 'Room Id', {
                                                    width: '50%'
                                                })}
                                            </div>
                                            <div>
                                                {this.onGenerateInput('Objective', 'Objective', {
                                                    width: '100%'
                                                })}
                                            </div>
                                            <div>
                                                <div>
                                                    {this.onGenerateDate('StartTime', 'Start Time')}
                                                    {this.onGenerateDate('FinishTime', 'Finish Time')}
                                                </div>
                                                <div>
                                                    <button type="button" onClick={this.onReset}>Clear</button>
                                                    <button type="button" onClick={this.onSearch}>Search</button>
                                                    <button type="button" onClick={this.onReserve}>Reserve</button>
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
                                        Result
                                    </Title>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <Content>
                                        <form className="bottom">
                                            {isRequesting && (
                                                <div className="isDisabled">
                                                    <Loader style={{
                                                        transform: 'scale(1.2)'
                                                    }} />
                                                </div>
                                            )}
                                            {
                                                !(_.get(this.state, 'ReserveStatus.status', 0) === -1) && (
                                                    <div>
                                                        Reserve result status: {_.get(this.state, 'ReserveStatus.status', 0) === 1 ? "Success" : `Failed (${_.get(this.state, 'ReserveStatus.message', '')})`}
                                                    </div>
                                                )
                                            }
                                            <Table striped hover>
                                                <thead>
                                                    <tr>
                                                        <td>Building ID</td>
                                                        <td>Room Name</td>
                                                        <td>Start Time</td>
                                                        <td>Finish Time</td>
                                                        <td>Reserved By</td>
                                                        <td>Objective</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        _.get(this.state, 'Results', []).map((it, key) => {
                                                            return (
                                                                <tr key={key}>
                                                                    <td>{it.BuildID}</td>
                                                                    <td>{it.RoomID}</td>
                                                                    <td>{moment(new Date(it.StartTime)).local("th").format('YYYY-MM-DD HH:mm:ss')}</td>
                                                                    <td>{moment(new Date(it.FinishTime)).local("th").format('YYYY-MM-DD HH:mm:ss')}</td>
                                                                    <td>{it.ReserveBy}</td>
                                                                    <td>{it.Objective}</td>
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
                </Grid>
            </div>
        );
    }
}

export default connect(Reservation);
