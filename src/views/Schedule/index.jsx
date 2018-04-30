import React, { Component } from "react";
import { Grid, Row, Col, Table } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import styled from 'styled-components';
import _ from 'lodash';
import connect from '../../redux/connectAll';
import Loader from '../../components/Loader';
import axios from 'axios';
import { getCookie } from '../../general';
import constraint from '../../variables/Constraint';
import PropTypes from 'prop-types';
import SelectBox from '../../components/SelectBox';
const { apiUri, timeOutTime } = constraint;

const Semester = ["2", "1"]
const Year = ["2017", "2016"]

const initialState = {
    "CSemester": "2",
    "CYear": "2017",
    "Table": {
        "MON": [],
        "TUE": [],
        "WED": [],
        "THU": [],
        "FRI": [],
    },
    "Midterm": [],
    "Final": [],
    "isLoading": false
}

const TimeStart = [8, 0];
const TimeEnd = [18, 0];

function generateTimeList() {
    let hour = TimeStart[0]
    let timeList = []

    while (hour < TimeEnd[0]) {
        timeList.push(`${hour} - ${hour + 1}`)
        hour++;
    }
    return timeList;
}

function getCellIndex(StartTime, EndTime) {
    let stHr = StartTime[0]
    let stMn = StartTime[1]
    let enHr = EndTime[0]
    let enMn = EndTime[1]

    return [2*(stHr -TimeStart[0]) + (stMn === 0 ? 0 : 1) + 1, 2*(enHr -TimeStart[0]) + (enMn === 0 ? 0 : 1)]
}

const TimeList = generateTimeList();

const All = styled.section`
.card .content {
    padding-bottom: 0px !important;
}
h1, h2, h3, h4 {
    margin-bottom: 0px;
    margin-top: 0px;
}

.with-padding {
    padding-left: 30px;
    padding-bottom: 10px;
}
`;
const Title = styled.section`
`;
const Content = styled.section`
&.setting {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;
    padding: 0px 20px;

    * {
        margin: 5px;
    }
}
&.no-bottom {
    margin-bottom: -20px;
    padding-top: 10px;
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
table {
    thead {
        td {
            background-color: #E5E5E5;
        }
    }
    tr {
        td {
            text-align: center;
            border: 1px solid #AAAAAA30;
            width: calc(100%/${() => 2*TimeList.length + 1});
            max-width: calc(100%/${() => 2*TimeList.length + 1});
            min-width: calc(100%/${() => 2*TimeList.length + 1});
        }
    }

    tbody.schedule {
        tr {
            td {
                &:first-of-type {
                    background-color: #EEE;
                }
                &.subject {
                    &:hover, &:active {
                        box-shadow: 0px 0px 10px #58C7FFAA;
                    }
                    &:hover {
                        filter: brightness(1.02);
                    }
                    &:active {
                        filter: brightness(0.98);
                    }
                    color: #FFF;
                    background: linear-gradient(to bottom right, #8BC5FF, #3998DB);

                    &.overlapped {
                        background: linear-gradient(to bottom right, #FF865D, #FF5E27)
                    }
                }
            }
        }
    }
}
`;

class Schedule extends Component {
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
            this.getTable();
        }, 0);
    }
    getTable = async () => {
        try {
            this.setState({
                isLoading: true
            })
            let response = await axios.post(`${ apiUri }/table/subj`, {
                "CYear": this.state.CYear,
                "CSemester": this.state.CSemester
            }, {
                headers: {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            response = response.data;
            let mid = await axios.post(`${apiUri}/table/mid`, {
                "CYear": this.state.CYear,
                "CSemester": this.state.CSemester
            }, {
                headers: {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            mid = mid.data;
            let final = await axios.post(`${apiUri}/table/fin`, {
                "CYear": this.state.CYear,
                "CSemester": this.state.CSemester
            }, {
                headers: {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            final = final.data;
            setTimeout(() => {
                this.setState({
                    ...response,
                    Table: {
                        ...response.Table
                    },
                    Midterm: mid.Table,
                    Final: final.Table,
                    isLoading: false
                })
            }, timeOutTime);
        } catch (e) {

        }
    }
    onChangeState = (fieldName) => {
        return (e) => {
            const value = e.target.value;
            this.setState((prevState) => {
                if(prevState[fieldName] !== value) {
                    setTimeout(() => {
                        this.getTable();
                    }, 200);
                }
                return ({
                    [fieldName]: value
                })
            });
        }
    }
    render() {
        const s = this.state;
        const { isLoading } = s;
        const Subject = Object.keys(s.Table).reduce((Subject, day) => {
            Subject[day] = Array.from(Array(TimeList.length*2 + 1)).map(() => {
                return ({
                    SubjID: '',
                    BID: '',
                    RID: '',
                    isContainedInfo: false,
                    SName: '',
                    colSpan: 1,
                    isUsed: false,
                    stIdx: -1,
                    enIdx: -1,
                    isOverlapped: false
                })
            })

            const InDaySubjects = _.get(s, `Table.${day}`, []);
            InDaySubjects.sort((a, b) => {
                const rA = getCellIndex(a.STime, b.FTime);
                const rB = getCellIndex(b.STime, b.FTime);

                if(rA[0] === rB[0]) return 0;
                return rA[0] < rB[0] ? -1 : 1;
            })
            InDaySubjects.forEach((item) => {
                let cellIdx = getCellIndex(item.STime, item.FTime)

                let isMerge = false;
                let mergeWith = [];
                let mergeSubject = new Set();

                if (Subject[day][cellIdx[0]].isUsed) {
                    isMerge = true;
                    let tmp = 0;
                    while (cellIdx[0] - tmp > 0 && Subject[day][cellIdx[0] - tmp].isUsed) {
                        if (Subject[day][cellIdx[0] - tmp].isContainedInfo && !mergeSubject.has(Subject[day][cellIdx[0] - tmp].SubjID)) {
                            mergeWith.push(_.cloneDeep(Subject[day][cellIdx[0] - tmp]));
                            mergeSubject.add(Subject[day][cellIdx[0] - tmp].SubjID)
                        }
                        tmp++;
                    }
                    mergeWith.push({
                        SubjID: item.SubjID,
                        BID: item.BID,
                        RID: item.RID,
                        SName: item.SName,
                        colSpan: cellIdx[1] - cellIdx[0] + 1,
                        isContainedInfo: true,
                        isUsed: true,
                        stIdx: cellIdx[0],
                        enIdx: cellIdx[1],
                        isOverlapped: false
                    });
                    mergeSubject.add(item.SubjID)
                }

                Subject[day][cellIdx[0]] = {
                    SubjID: item.SubjID,
                    BID: item.BID,
                    RID: item.RID,
                    SName: item.SName,
                    colSpan: cellIdx[1] - cellIdx[0] + 1,
                    isContainedInfo: true,
                    isUsed: true,
                    stIdx: cellIdx[0],
                    enIdx: cellIdx[1],
                    isOverlapped: false
                }

                for (let i = 1; i < cellIdx[1] - cellIdx[0] + 1; i++) {
                    if (Subject[day][cellIdx[0] + i].isUsed && Subject[day][cellIdx[0] + i].isContainedInfo && !mergeSubject.has(Subject[day][cellIdx[0] + i].SubjID)) {
                        isMerge = true;
                        mergeWith.push(_.cloneDeep(Subject[day][cellIdx[0] + i]))
                        mergeSubject.add(Subject[day][cellIdx[0] + i].SubjID)
                    }
                    Subject[day][cellIdx[0] + i] = {
                        colSpan: -1,
                        isUsed: true
                    }
                }

                if(isMerge) {
                    Subject[day] = Array.from(Array(TimeList.length * 2 + 1)).map(() => {
                        return ({
                            SubjID: '',
                            BID: '',
                            RID: '',
                            SName: '',
                            isContainedInfo: false,
                            colSpan: 1,
                            isUsed: false,
                            stIdx: -1,
                            enIdx: -1,
                            isOverlapped: false
                        })
                    })

                    let res = mergeWith.reduce((acc, item) => {
                        acc.min = Math.min(item.stIdx, acc.min);
                        acc.max = Math.max(item.enIdx, acc.max);
                        acc.SubjID += `${item.SubjID}, `
                        acc.BID += `${item.BID}, `
                        acc.RID += `${item.RID}, `
                        return acc;
                    }, {
                        min: 9999999999,
                        max: -1,
                        SubjID: '',
                        BID: '',
                        RID: ''
                    })

                    Subject[day][res.min] = {
                        SubjID: res.SubjID,
                        BID: res.BID,
                        RID: res.RID,
                        SName: item.SName,
                        colSpan: res.max - res.min+ 1,
                        isContainedInfo: true,
                        isUsed: true,
                        stIdx: res.min,
                        enIdx: res.max,
                        isOverlapped: true
                    }

                    for (let i = 1; i < res.max - res.min + 1; i++) {
                        Subject[day][res.min + i] = {
                            colSpan: -1,
                            isUsed: true
                        }
                    }
                }
            })

            Subject[day] = Subject[day].filter((item) => {
                return item.colSpan !== -1
            })
            return Subject;
        }, {})

        return (
            <div className="content">
                <All>
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                <Card
                                    title={
                                        <Title>
                                            <h3>Setting</h3>
                                        </Title>
                                    }
                                    ctTableFullWidth
                                    ctTableResponsive
                                    content={
                                        <Content className="setting">
                                            <span>Semester</span>
                                            <SelectBox
                                                options={Semester}
                                                onChange={this.onChangeState("CSemester")}
                                            />
                                            <span>/</span>
                                            <SelectBox
                                                options={Year}
                                                onChange={this.onChangeState("CYear")}
                                            />
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
                                            <h2>Schedule</h2>
                                        </Title>
                                        }
                                    ctTableFullWidth
                                    ctTableResponsive
                                    content={
                                        <Content className="no-bottom">
                                            <form>
                                                {isLoading && (
                                                    <div className="isDisabled">
                                                        <Loader style={{
                                                            transform: 'scale(1.2)'
                                                        }} />
                                                    </div>
                                                )}
                                                <Table striped hover>
                                                    <thead>
                                                        <tr>
                                                            {
                                                                [''].concat(TimeList).map((item, idx) => {
                                                                    return (
                                                                        <td key={idx} colSpan={idx === 0 ? 1 : 2}>
                                                                            {item}
                                                                        </td>
                                                                    );
                                                                })
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody className="schedule">
                                                        {
                                                            Object.keys(Subject).map((day, idx) => {
                                                                return (
                                                                    <tr key={idx}>
                                                                        {
                                                                            Subject[day].map((item, idx2) => {
                                                                                if (idx2 === 0) {
                                                                                    return (
                                                                                        <td key={idx2}>
                                                                                            {day}
                                                                                        </td>
                                                                                    );
                                                                                }
                                                                                return (
                                                                                    <td key={idx2} colSpan={item.colSpan} className={item.isContainedInfo ? `subject ${item.isOverlapped ? 'overlapped' : ''}` : ''}>
                                                                                        {item.isContainedInfo ? (
                                                                                            <span>
                                                                                                [{item.SubjID}] {item.SName}<br />
                                                                                                Building-{item.BID} ({item.RID})
                                                                                        </span>
                                                                                        ) : ' '}
                                                                                    </td>
                                                                                );
                                                                            })
                                                                        }
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
                                            <h2>Exam</h2>
                                        </Title>
                                    }
                                    ctTableFullWidth
                                    ctTableResponsive
                                    content={
                                        <Content className="no-bottom">
                                            <h3 className="with-padding">Midterm</h3>
                                            <form>
                                                {isLoading && (
                                                    <div className="isDisabled">
                                                        <Loader style={{
                                                            transform: 'scale(1.2)'
                                                        }} />
                                                    </div>
                                                )}
                                                <Table striped hover>
                                                    <thead>
                                                        <tr>
                                                            <td>Course ID</td>
                                                            <td>Course Name</td>
                                                            <td>Date</td>
                                                            <td>Time</td>
                                                            <td>Building</td>
                                                            <td>Room No</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            s.Midterm.map((item, key) => {
                                                                return item.Place.map((Place, idx) => {
                                                                    return (
                                                                        <tr key={key}>
                                                                            <td>{item.SubjID}</td>
                                                                            <td>{item.SName}</td>
                                                                            <td>{item.Date}</td>
                                                                            <td>{`${item.Start} - ${item.Finish}`}</td>
                                                                            <td>{Place.BuildID}</td>
                                                                            <td>{_.get(Place, 'RoomID', []).join(', ')}</td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            })
                                                        }
                                                    </tbody>
                                                </Table>
                                            </form>
                                            <h3 className="with-padding">Final</h3>
                                            <form>
                                                {isLoading && (
                                                    <div className="isDisabled">
                                                        <Loader style={{
                                                            transform: 'scale(1.2)'
                                                        }} />
                                                    </div>
                                                )}
                                                <Table striped hover>
                                                    <thead>
                                                        <tr>
                                                            <td>Course ID</td>
                                                            <td>Course Name</td>
                                                            <td>Date</td>
                                                            <td>Time</td>
                                                            <td>Building</td>
                                                            <td>Room No</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            s.Final.map((item, key) => {
                                                                return item.Place.map((Place, idx) => {
                                                                    return (
                                                                        <tr key={key}>
                                                                            <td>{item.SubjID}</td>
                                                                            <td>{item.SName}</td>
                                                                            <td>{item.Date}</td>
                                                                            <td>{`${item.Start} - ${item.Finish}`}</td>
                                                                            <td>{Place.BuildID}</td>
                                                                            <td>{_.get(Place, 'RoomID', []).join(', ')}</td>
                                                                        </tr>
                                                                    )
                                                                })
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
                </All>
            </div>
        );
    }
}

export default connect(Schedule);
