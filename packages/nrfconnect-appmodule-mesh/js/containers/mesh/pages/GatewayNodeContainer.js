/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React, {PropTypes} from 'react';
import {List, Record} from 'immutable';

import DeviceDetailsContainer from '../MeshDeviceDetails';
import HandleTableContainer from '../handleTableContainer';
import { Button, Col, Nav, NavItem, Tab, Tabs, Row } from 'react-bootstrap';

import * as AdapterActions from '../../../actions/mesh/meshAdapterActions';

import Component from 'react-pure-render/component';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


class GatewayNodeContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            pageView,
            adapter,
            connectToAdapter,
            closeAdapter
        } = this.props;


        let connectedSnrsNav = adapter.api.adapters.map(device => {
            const port = device._state._port;
            return (
                <NavItem onClick={() => connectToAdapter(port) } eventKey={device._instanceId}>
                    {device._instanceId} - {device.state.port}
                </NavItem>);
        });

        const selectedAdapter = this.props.adapter.api.selectedAdapter;

        if (selectedAdapter) {
            connectedSnrsNav.push(
                <NavItem onClick={() => closeAdapter(selectedAdapter) } eventKey={'close'}>
                    Close Connection
                </NavItem>)
        }
        let connectedSnrsTab = adapter.api.adapters.map(device => {
            return (
                <Tab.Pane eventKey={device._instanceId}>
                    <div >
                        <div style={{ float: 'left' }}>
                            <DeviceDetailsContainer />
                        </div>
                        <div style={{ float: 'left' }}>
                            <HandleTableContainer />
                        </div>
                    </div>
                </Tab.Pane>);
        });


        const Tab1 = (
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <Row className="clearfix">

                    <Col sm={2}>
                        <h4> Select mesh gateway: </h4>
                        <br />
                        <Nav  bsStyle="pills" stacked>
                            {connectedSnrsNav}
                        </Nav>
                    </Col>

                    <Tab.Content animation>
                        {connectedSnrsTab}
                    </Tab.Content>
                </Row>
            </Tab.Container>
        );

        return (
            <div>
                {Tab1}
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {
        meshPageSelector,
        adapter,
    } = state;

    const pageView = meshPageSelector.get('selectedPage');
    return {
        pageView: pageView,
        adapter,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GatewayNodeContainer);

GatewayNodeContainer.propTypes = {

};
