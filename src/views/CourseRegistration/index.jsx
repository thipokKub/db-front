import React, { Component } from "react";
import { Grid, Row, Col, Table } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import connectAll from '../../redux/connectAll';
import styled from 'styled-components';
import axios from 'axios';
import Constraint  from '../../variables/Constraint';
import _ from 'lodash';
import SelectBox from '../../components/SelectBox';
import Loader from '../../components/Loader';
import { getCookie } from '../../general';

const { apiUri } = Constraint;

const thArray = ["NO", "code", "name", "sec", "credits", "status"]
const Year = ["2017", "2016"]
const Semester = ["1", "2"]
const UserID = ["1234567890", "4534534530", "6668844444", "8886655551", "9876543210", "9998877777"]

const transitionTime = 0.2
const showErrorTime = 1

const InputStyle = styled.div`
display: inline-block;
position: relative;
width: 100%;
input {
    /* outline: none; */
    width: 100%;
    border: none;
    /* background: none; */

    &:disabled {
        background: #FFFFFFBB !important;
    }
}
span {
    color: red;
    opacity: 0;
    visibility: hidden;
    display: block;
    transition: all ${transitionTime}s;

    &.show {
        opacity: 1;
        visibility: visible;
    }
}
`
//Number only
class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            validatedState: 0,
            errorMsg: '',
            isShown: false,
            isDisplay: true,
            timeoutIndex: -1
        }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.isReset) {
            this.setState({
                text: '',
                validatedState: 0,
                errorMsg: '',
                isShown: false,
                isDisplay: true,
                timeoutIndex: -1
            })
        }
    }
    onValidate = (text) => {
        const { exactDigit } = this.props;
        if(!(/^[0-9]*$/.test(text))) return 1;
        if(typeof(exactDigit) === "number") {
            if(text.length !== exactDigit) return 2;
        }
        return 99;
    }
    onChangeState = (fieldName) => {
        return (e) => {
            const validatedState = this.onValidate(e.target.value)
            const { exactDigit, onChange, isForcedShow } = this.props
            let { onValidate } = this.props
            if(!onValidate) {
                onValidate = () => {}
            }
            const text = e.target.value
            if(validatedState === 99 || validatedState === 2) {
                onChange(e)
                this.setState({
                   [fieldName]: text
               })
           }
           if(validatedState === 1) {
                onValidate({ target: { value: false } })
                clearTimeout(this.state.timeoutIndex)
                this.setState({
                    errorMsg: 'Must contain number only',
                    isShown: true,
                    isDisplay: true,
                    timeoutIndex: setTimeout(() => {
                        if(!isForcedShow) {
                            this.setState({ isShown: false }, () => {
                                setTimeout(() => {
                                    this.setState({
                                        isDisplay: false
                                    })
                                }, transitionTime * 1000)
                            })
                        }
                    }, showErrorTime * 1000)
               })
               if (!exactDigit) {
                   onValidate({ target: { value: true } })
               }
           } else if(validatedState === 2) {
                onValidate({ target: { value: false } })
                clearTimeout(this.state.timeoutIndex)
                this.setState({
                   errorMsg: `Must be exactly ${this.props.exactDigit} digits`,
                   isShown: true,
                   isDisplay: true,
                   timeoutIndex: setTimeout(() => {
                        if(!isForcedShow) {
                            this.setState({ isShown: false }, () => {
                                setTimeout(() => {
                                            this.setState({
                                        isDisplay: false
                                    })
                                }, transitionTime * 1000)
                            })
                        }
                    }, showErrorTime * 1000)
               })
           } else {
               if(exactDigit) {
                   if (text.length === exactDigit) {
                       onValidate({ target: { value: true } })
                   } else {
                       onValidate({target: { value: false }})
                   }
               } else {
                    onValidate({ target: { value: true } })
               }
               this.setState({
                   errorMsg: ''
               })
           }
        }
    }
    render() {
        const { exactDigit, onChange, isForcedShow, onValidate, style, isReset, ...props } = this.props
        const { text, errorMsg, isShown, isDisplay } = this.state

        return (
            <InputStyle style={style}>
                <input {...props} onChange={this.onChangeState("text")} value={text} maxLength={exactDigit} />
                {(errorMsg.length > 0 && (isDisplay || isForcedShow)) && <span className={isShown ? 'show' : ''}>{errorMsg}</span>}
            </InputStyle>
        );
    }
}

const HoverWrapped = styled.div`
/* background: #777; */
display: block;
width: 25px;
height: 25px;
line-height: 25px;
text-align: center;
button {
    height: 25px;
    box-sizing: border-box;
}
div {
    padding: 0px !important;
}
.onHover {
    display: none;
}
.content {
    display: initial;
}
&:hover {
    .onHover {
        display: initial;
    }
    .content {
        display: none;
    }
}
`;

const HoverChange = (props) => {
    const { content, contentHover, onClick } = props;
    return (
        <HoverWrapped>
            <div className="onHover">
                {contentHover}
            </div>
            <div className="content" onClick={onClick}>
                {content}
            </div>
        </HoverWrapped>
    );
}

const TopDiv = styled.div`
display: flex;
justify-content: center;
align-items: center;
box-sizing: border-box;
padding: 0px 20px;
* {
    margin: 5px;
}
&> div.login {
    display: flex;
    align-items: center;
    flex: 1;
}
`;

const Wrapper = styled.div`
button {
    background: none;
    text-align: center;
    text-decoration: none;
    outline: none;
    box-sizing: border-box;
    border-radius: 8px;

    &.submit {
        padding: 10px 20px;
        margin-left: 20px;
    }
    &:hover {
        border: 1px solid #3190FF;
        color: #3190FF;
    }
    &active {
        border-color: #2267B8;
        color: #2267B8;
    }
}
`

const simulatedTimePeroid = ['Before Semester Start', 'After Semester Start', 'After Semester Midterm']

class CourseRegistration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader: false,
            newName: '',
            newCredits: '',
            isReset: false,
            isLoading: false,
            isValid: true,
            courses: [],
            UserID: UserID[0],
            Semester: Semester[0],
            Year: Year[0],
            prevCourse: [],
            simulatedTimePeroid: simulatedTimePeroid[0],
            isDuplicate: false
        }
        this.onUpdatePrevCourse()
    }

    onUpdatePrevCourse = async () => {
        setTimeout(async () => {
            try {
                let suffix = '/request/result';
                if(this.state.simulatedTimePeroid !== simulatedTimePeroid[0]) {
                    suffix = '/register/result';
                }

                let prevCourse = await axios.post(`${apiUri}${suffix}`, {
                    "CYear": this.state.Year,
                    "CSemester": this.state.Semester,
                }, {
                    "headers": {
                        "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                        "Content-Type": "application/json"
                    }
                });
                // this.onCheckRequestDuplicate();
                prevCourse = _.get(prevCourse, 'data.Subjects', []).map((it) => {
                    return ({
                        code: it.SubjID,
                        name: it.SName,
                        credits: it.Credit,
                        sec: it.SecID,
                        status: it.Grade !== "W" ? "Enrolled" : "Widthdrawn"
                    });
                });
                this.setState({
                    prevCourse: prevCourse
                })
            } catch (e) {
                console.log(e)
            }
        }, 0)
    }

    componentWillUpdate(nextProps, nextState) {
        const { UserID, Semester, Year, simulatedTimePeroid } = nextState;
        const pUserID = this.state.UserID
        const pSemester = this.state.Semester
        const pYear = this.state.Year
        const psimulatedTimePeroid = this.state.simulatedTimePeroid

        if (UserID !== pUserID || pSemester !== Semester || pYear !== Year || simulatedTimePeroid !== psimulatedTimePeroid) {
            this.onUpdatePrevCourse()
        }
    }

    onChangeState = (fieldName) => {
        return (e) => {
            this.setState({
                [fieldName]: e.target.value
            }, () => {
                const { validateCourseId, newName, newCredits } = this.state;
                if(!validateCourseId && (newName.length !== 0 || newCredits.length !== 0)){
                    this.setState({
                        newName: '',
                        newCredits: ''
                    })
                }
            })
        }
    }

    onGetInfo = async (e) => {
        try {
            if(e.target.value) {
                this.setState({
                    validateCourseId: e.target.value,
                    showLoader: e.target.value,
                    isLoading: true
                })
                setTimeout(async () => {
                    try {
                        let response = await axios.get(`${apiUri}/register/detail?SubjID=${this.state.newCourseId}&CYear=${this.state.Year}&CSemester=${this.state.Semester}`)
                        if (response.data.status !== 1) {
                            this.setState({
                                showLoader: false,
                                newName: 'No Course Found',
                                newCredits: '-',
                                isLoading: false,
                                isValid: false
                            })
                        } else {
                            this.setState({
                                showLoader: false,
                                newName: response.data.SName,
                                newCredits: response.data.Credit,
                                isLoading: false,
                                isValid: true
                            })
                        }
                    } catch (e) {
                        this.setState({
                            showLoader: false,
                            newName: 'No Course Found',
                            newCredits: '-',
                            isLoading: false,
                            isValid: false
                        })
                    }
                    
                }, 1000);
            }
        } catch(e) {
            this.setState({
                showLoader: false,
                newName: 'No Course Found',
                newCredits: '-',
                isLoading: false,
                isValid: false
            })
        }
    }

    onSubmitPrev = async () => {
        try {
            if(this.state.simulatedTimePeroid === simulatedTimePeroid[0]) {
                return this.onDeleteRequest();
            }
            await axios.delete(`${ apiUri }/register/remove`, {
                data: {
                    "CSemester": this.state.Semester,
                    "CYear": this.state.Year,
                    "Subjects": _.get(this.state, 'prevCourse', []).filter((it) => {
                        return it.status === "Pending"
                    }).map((it) => {
                        return ({
                            "SubjID": it.code,
                            "SecID": it.sec
                        });
                    })
                },
                "headers": {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            this.onUpdatePrevCourse()
        } catch (e) {
            console.log(e)
        }
    }

    onRemoveCourse = (index) => {
        return () => {
            const newCourses = [ ...this.state.courses ]
            newCourses.splice(index, 1)
            this.setState({
                courses: newCourses
            })
        }
    }

    onDeleteRequest = async () => {
        try {
            if (!window.confirm('Are you sure?')) {
                return this.onUpdatePrevCourse();
            }
            await axios.delete(`${apiUri}/request`, {
                "headers": {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                },
                "data": {
                    "CYear": this.state.Year,
                    "CSemester": this.state.Semester
                }
            });
            this.onUpdatePrevCourse();
        } catch (e) {

        }
    }

    onAddCourse = () => {
        if(!this.state.isLoading) {
            this.setState((prevState) => {
                return ({
                    newCourseId: "",
                    validateCourseId: false,
                    newCourseSec: "",
                    validateSec: false,
                    newName: "",
                    newCredits: "",
                    showLoader: false,
                    isReset: true,
                    courses: prevState.courses.concat({
                        code: prevState.newCourseId,
                        name: prevState.newName,
                        sec: prevState.newCourseSec,
                        credits: prevState.newCredits,
                        status: "Pending"
                    })
                });
            }, () => {
                setTimeout(() => {
                    this.setState({
                        isReset: false
                    })
                }, 50);
            })
        }
    }

    onWidthdraw = async () => {
        try {
            if(!window.confirm('Are you sure?')) {
                return this.onUpdatePrevCourse();
            }
            await axios.post(`${apiUri}/register/withdraw`, {
                "CYear": this.state.Year,
                "CSemester": this.state.Semester,
                "Subjects": _.get(this.state, 'prevCourse', []).filter((it) => {
                    return it.status === "Pending"
                }).map((it) => {
                    return ({
                        "SubjID": it.code,
                        "SecID": it.sec
                    });
                })
            }, {
                "headers": {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            this.onUpdatePrevCourse();
        } catch (e) {
            console.log(e)
        }
    }

    onSubmit = async () => {
        try {
            let link = ''

            switch (this.state.simulatedTimePeroid) {
                case simulatedTimePeroid[0]:
                    link = 'request';
                    break;
                case simulatedTimePeroid[1]:
                    link = 'register/add';
                    break;
                case simulatedTimePeroid[2]:
                    break;
                default:
            }

            let response = await axios.post(`${apiUri}/${link}`, {
                "CYear": this.state.Year,
                "CSemester": this.state.Semester,
                "Subjects": _.get(this.state, 'courses', []).map((it) => {
                    return {
                        "SubjID": it.code,
                        "SecID": it.sec
                    }
                })
            }, {
                "headers": {
                    "Authorization": `Bearer ${this.props.page.token || getCookie('token')}`,
                    "Content-Type": "application/json"
                }
            })
            
            response = _.get(response, 'data');
            if (_.get(response, 'result')) {
                response = _.get(response, 'result');
                this.setState({
                    courses: _.get(this.state, 'courses', []).map((it, idx) => {
                        return {
                            ...it,
                            status: response[idx].Result === "success" ? "Registered" : "Failed"
                        }
                    })
                })
            }
            this.onUpdatePrevCourse()
        } catch(e) {
            console.log(e)
        }
    }

    onReset = () => {
        this.setState((prevState) => {
            return ({
                newCourseId: "",
                validateCourseId: false,
                newCourseSec: "",
                validateSec: false,
                newName: "",
                newCredits: "",
                showLoader: false,
                isReset: true,
                courses: [],
                isSimulatedWidthdraw: "Disable"
            });
        }, () => {
            setTimeout(() => {
                this.setState({
                    isReset: false
                })
            }, 50);
        })
    }

    onRemoveRegistereCourse = (idx) => {
        return () => {
            let newPrevCourses = [ ...this.state.prevCourse ]
            newPrevCourses[idx].status = "Pending"
            this.setState({
                prevCourse: newPrevCourses
            })
        }
    }

    render() {
        const { isReset, courses, newCourseId, newCourseSec, prevCourse } = this.state;
        let isDuplicate = courses.reduce((acc, it) => {
            if(it.code === newCourseId && it.sec === newCourseSec) {
                return true;
            }
            return acc;
        }, false)
        const totalCredit = prevCourse.reduce((acc, it) => {
            return acc + it.credits
        }, 0)
        return (
            <div className="content">
                <Wrapper>
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                <Card
                                    title="Settings"
                                    ctTableFullWidth
                                    ctTableResponsive
                                    content={
                                        <TopDiv>
                                            <div className="login">
                                                <span>Simulate widthdraw peroid</span>
                                                <SelectBox
                                                    options={simulatedTimePeroid}
                                                    onChange={this.onChangeState("simulatedTimePeroid")}
                                                />
                                            </div>
                                            <span>Semester</span>
                                            <SelectBox
                                                options={Semester}
                                                onChange={this.onChangeState("Semester")}
                                            />
                                            <span>/</span>
                                            <SelectBox
                                                options={Year}
                                                onChange={this.onChangeState("Year")}
                                            />
                                        </TopDiv>
                                    }
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Card
                                    title={(this.state.simulatedTimePeroid === simulatedTimePeroid[0]) ? "Request Course(s)" : "Registered Course(s)"}
                                    category="This is the current course(s) enrollment"
                                    ctTableFullWidth
                                    ctTableResponsive
                                    content={
                                        <div>
                                            <Table striped hover>
                                                <thead>
                                                    <tr>
                                                        {thArray.map((prop, key) => {
                                                            return <th key={key} style={{
                                                                width: `${ 100 / thArray.length }% `
                                                            }}>{prop}</th>;
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prevCourse.map((prop, key) => {
                                                        return (
                                                            <tr key={key}>
                                                                <td>
                                                                    <HoverChange
                                                                        content={
                                                                            <div>
                                                                                {key + 1}
                                                                            </div>
                                                                        }
                                                                        contentHover={
                                                                            (this.state.simulatedTimePeroid === simulatedTimePeroid[0]) ? (
                                                                                <div>
                                                                                    {key + 1}
                                                                                </div>
                                                                            ) : (
                                                                                <button onClick={this.onRemoveRegistereCourse(key)}>
                                                                                    -
                                                                                </button>
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: '100%',
                                                                            textAlign: 'center'
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td>{prop.code}</td>
                                                                <td>{prop.name}</td>
                                                                <td>{prop.sec}</td>
                                                                <td>{prop.credits}</td>
                                                                <td>{prop.status}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            style={{
                                                                background: '#EDEDED'
                                                            }}
                                                        >Total Credit</td>
                                                        <td
                                                            colSpan={1}
                                                            style={{
                                                                background: '#EDEDED'
                                                            }}
                                                        >{totalCredit}</td>
                                                        <td
                                                            colSpan={1}
                                                            style={{
                                                                background: '#EDEDED'
                                                            }}
                                                        >Credit(s)</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            {
                                                (this.state.simulatedTimePeroid === simulatedTimePeroid[0]) ? (
                                                    <button className="submit" onClick={this.onSubmitPrev}>Delete Request</button>
                                                ) : (this.state.simulatedTimePeroid === simulatedTimePeroid[2]) ? (
                                                    <button className="submit" onClick={this.onWidthdraw}>Request widthdrawn</button>
                                                ) : (
                                                    <button className="submit" onClick={this.onSubmitPrev}>Submit</button>
                                                )
                                            }
                                            {
                                                (this.state.simulatedTimePeroid === simulatedTimePeroid[1]) && (
                                                    <button className="submit" onClick={this.onUpdatePrevCourse}>Cancel</button>
                                                )
                                            }
                                        </div>
                                    }
                                />
                            </Col>
                        </Row>
                        {
                            !(this.state.simulatedTimePeroid === simulatedTimePeroid[2]) && (
                                <Row>
                                    <Col md={12}>
                                        <Card
                                            title="Request Register Course(s)"
                                            category="Please type course id you desire to register."
                                            ctTableFullWidth
                                            ctTableResponsive
                                            content={
                                                <div>
                                                    {
                                                        (this.state.simulatedTimePeroid === simulatedTimePeroid[0] &&
                                                            this.state.prevCourse.length !== 0
                                                        ) && (
                                                            <div style={{
                                                                height: 'calc(100% - 30px)',
                                                                width: 'calc(100% - 30px)',
                                                                position: 'absolute',
                                                                backgroundColor: 'rgba(255,255,255, 0.7)',
                                                                top: '0',
                                                                left: '15px',
                                                                zIndex: '10',
                                                                borderRadius: '3px'
                                                            }} />
                                                        )
                                                    }
                                                    <Table striped hover>
                                                        <thead>
                                                            <tr>
                                                                {thArray.map((prop, key) => {
                                                                    return <th key={key} style={{
                                                                        width: `${100 / thArray.length}% `
                                                                    }}>{prop}</th>;
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {courses.map((prop, key) => {
                                                                return (
                                                                    <tr key={key}>
                                                                        <td>
                                                                            <HoverChange
                                                                                content={
                                                                                    <div>
                                                                                        {key + 1}
                                                                                    </div>
                                                                                }
                                                                                contentHover={
                                                                                    <button onClick={this.onRemoveCourse(key)}>
                                                                                        -
                                                                            </button>
                                                                                }
                                                                                style={{
                                                                                    width: '100%',
                                                                                    textAlign: 'center'
                                                                                }}
                                                                            />
                                                                        </td>
                                                                        <td>{prop.code}</td>
                                                                        <td>{prop.name}</td>
                                                                        <td>{prop.sec}</td>
                                                                        <td>{prop.credits}</td>
                                                                        <td>{prop.status}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            <tr>
                                                                <td>
                                                                    <button
                                                                        onClick={this.onAddCourse}
                                                                        disabled={!(this.state.validateCourseId && this.state.validateSec && this.state.isValid && !isDuplicate)}
                                                                    >+</button>
                                                                </td>
                                                                <td style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Input
                                                                        exactDigit={7}
                                                                        onChange={this.onChangeState("newCourseId")}
                                                                        isReset={isReset}
                                                                        onValidate={this.onGetInfo}
                                                                        style={{
                                                                            width: `calc(100 % - 0.7 * 32px - 10px)`
                                                                        }}
                                                                        disabled={this.state.showLoader}
                                                                        placeholder="Code"
                                                                    />
                                                                    {
                                                                        this.state.showLoader && (
                                                                            <Loader style={{
                                                                                marginLeft: '7px'
                                                                            }} />
                                                                        )
                                                                    }
                                                                </td>
                                                                <td>{this.state.newName}</td>
                                                                <td><Input
                                                                    isReset={isReset}
                                                                    onChange={this.onChangeState("newCourseSec")}
                                                                    onValidate={this.onChangeState("validateSec")}
                                                                    disabled={this.state.showLoader}
                                                                    placeholder="Section"
                                                                /></td>
                                                                <td>{this.state.newCredits}</td>
                                                                <td>Not Add</td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                    <button className="submit" onClick={this.onSubmit}>Submit</button><button className="submit" onClick={this.onReset}>Reset</button>
                                                </div>
                                            }
                                        />
                                    </Col>
                                </Row>
                            )
                        }
                    </Grid>
                </Wrapper>
            </div>
        );
    }
}

export default connectAll(CourseRegistration);
