import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import styled from 'styled-components';
import logo from "assets/img/Chula_low_poly.png";

import axios from 'axios';
import constraint from '../../variables/Constraint';
import _ from 'lodash';
const { apiUri } = constraint;

const AnnouncementHeader = styled.div`
display: flex;
align-items: center;
div {
    display: inline-block;
    width: 50px;
    margin-right: 20px;
    margin-left: 20px;
    img {
        width: 100%;
    }
}
`;

const AnnouncementSection = styled.section`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
box-sizing: border-box;
padding: 0px 20px;

p::before {
    content: "";
    display: inline-block;
    width: 20px;
}

hr.line {
    margin: -5px 0px 10px 0px;
    width: 100%;
}

ul {
    width: 100%;
    margin-top: 20px;
    list-style-type: none;

    li:before {
        content: ">";
        display: inline-block;
        width: 20px;

        p {
            margin: 0;
            padding: 0;
        }
    }
}
`;

class Default extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Result: []
        }
    }
    componentWillMount() {
        setTimeout(async () => {
            let response = await axios.get(`${apiUri}/announcement`);
            this.setState({ Result: response.data.result })
        }, 200);
    }
    render() {
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={
                                    <AnnouncementHeader>
                                        <div>
                                            <img src={logo} alt="logo" />
                                        </div>
                                        <h1>Announcement</h1>
                                    </AnnouncementHeader>
                                }
                                ctTableFullWidth
                                ctTableResponsive
                                content={
                                    <AnnouncementSection>
                                        <hr className="line" />
                                        {
                                            // <p>Officia do velit exercitation amet. Tempor esse exercitation consequat in amet aute veniam tempor aliqua magna. Dolore ad deserunt aliqua dolore dolore enim aute voluptate est veniam velit officia consectetur. Sit reprehenderit id esse nisi ullamco esse occaecat reprehenderit minim.Dolor in dolore voluptate non incididunt pariatur ad proident pariatur cupidatat occaecat occaecat. Sint pariatur nostrud aute et occaecat eiusmod qui culpa occaecat. Et excepteur consectetur aute esse et laboris eu elit velit voluptate labore.Tempor amet elit id cupidatat deserunt sint. Esse ex fugiat amet excepteur commodo elit labore. Proident et do tempor esse qui nulla officia duis nostrud est eiusmod proident ad occaecat. Nisi enim tempor qui dolor do.</p>
                                            // <p>Velit eu excepteur ipsum anim proident nostrud ea ex nisi proident ad aliquip qui. Magna dolore excepteur aliqua consequat minim mollit in proident. Pariatur tempor incididunt quis ipsum minim labore esse exercitation. Irure in fugiat dolore aliqua. Labore fugiat id laboris qui incididunt ut magna nisi officia nostrud. Laboris reprehenderit nulla voluptate eiusmod irure voluptate nulla dolor. Do officia elit sit officia quis. Fugiat voluptate fugiat tempor esse exercitation. Ex consequat cupidatat consectetur irure fugiat. Ullamco cillum do cillum aute ullamco qui aute incididunt ex. Deserunt officia commodo aute quis irure reprehenderit do adipisicing nulla ad cillum aute ad nulla. Ut cillum labore cupidatat veniam sunt qui esse eiusmod. Nostrud fugiat adipisicing exercitation eu aliqua labore ex ipsum exercitation. Culpa irure fugiat anim commodo anim mollit. Excepteur exercitation in magna minim elit eiusmod cupidatat id do sint laboris ea est.</p>
                                            // <hr className="line" />
                                        }
                                        <ul>
                                            {
                                                _.get(this.state, 'Result', []).sort((a, b) => {
                                                    if (((new Date(a.ADate))) < (new Date(b.ADate))) return -1;
                                                    return 1;
                                                }).map((it, key) => {
                                                    return (
                                                        <li key={key} style={{ width: '100%'}}>
                                                            [Time: {(new Date(it.ADate)).toUTCString()}]<br />
                                                            <p>
                                                                {it.Description}
                                                            </p>
                                                        </li>
                                                    );
                                                })
                                            }
                                        </ul>
                                    </AnnouncementSection>
                                }
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default Default;
