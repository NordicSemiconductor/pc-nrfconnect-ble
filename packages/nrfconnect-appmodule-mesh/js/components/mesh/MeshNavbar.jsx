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

import React from 'react';
import Component from 'react-pure-render/component';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Nav, NavDropdown, NavItem, Button, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';

import AdapterSelector from './MeshAdapterSelector';
import * as MeshAdapterActions from '../../actions/mesh/meshAdapterActions';
import * as meshPageSelectorActions from '../../actions/mesh/meshPageSelectorActions';

import * as AppActions from '../../actions/appActions';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStyle: { boxShadow: 'inset 0 5px 10px #133e40' },
            passiveStyle: {},
            adapterState: { connected: false },
        };
    }

    _onViewChange(newView) {
        this.props.onChangeMainView(newView);
    }

    _getClassForTabButton(itemName) {
        return 'btn btn-primary btn-nordic padded-row' + (this.props.view === itemName ? ' active' : '');
    }

    componentDidMount() {
        const { onChangeMainView } = this.props;
        window.addEventListener('core:connection-map', () => { onChangeMainView('ConnectionMap'); });
        window.addEventListener('core:server-setup', () => { onChangeMainView('ServerSetup'); });
    }

    render() {
        const {
            connectToAdapter, //mesh
            toggleRightSideBar,
            setPageView,
            pageView,
        } = this.props;

        function handleSelect(eventKey) {
            console.log("Keypress");
            setPageView(eventKey)
        }

        return (
            <div className='nav-bar'>
                <Nav className="nav-bar-tabs" bsStyle="tabs" activeKey={pageView} onSelect={handleSelect}>
                    <NavItem className="nav-bar-tabs" eventKey="Intro" >Quick start -></NavItem>
                    <NavItem className="nav-bar-tabs" eventKey="Program" >Programing -> </NavItem>
                    <NavItem className="nav-bar-tabs" eventKey="Initialize" >Initializing -></NavItem>
                    <NavItem className="nav-bar-tabs" eventKey="GatewayNode" >Gateway Node</NavItem>
                    <NavItem disabled={true} />
                    <NavItem disabled={true} />
                    <NavItem className="nav-bar-tabs" eventKey="DFU" >DFU</NavItem>
                    <NavItem className="nav-bar-tabs" eventKey="About" >About</NavItem>
                </Nav>

            </div>
        );
    }
}

// <div>
//     <a href='http://www.nordicsemi.com' target='_blank'><img className='nrfconnect-logo' src='resources/nrfconnect_neg.png' /></a>
// </div>

function mapStateToProps(state) {
    const { adapter, meshPageSelectorActions, meshPageSelector } = state;
    const pageView = meshPageSelector.get('selectedPage');

    return {
        state,
        pageView: pageView,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(MeshAdapterActions, dispatch),
        bindActionCreators(meshPageSelectorActions, dispatch),
        bindActionCreators(AppActions, dispatch),
    );
    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps)(NavBar);
