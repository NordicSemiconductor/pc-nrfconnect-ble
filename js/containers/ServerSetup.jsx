/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

import React, { PropTypes } from 'react';

import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ServerSetupActions from '../actions/serverSetupActions';
import * as AdapterActions from '../actions/adapterActions';

import AddNewItem from '../components/AddNewItem';
import ServiceItem from '../components/ServiceItem';
import ServiceEditor from '../components/ServiceEditor';

import { getInstanceIds } from '../utils/api';
//import CharacteristicEditor from './components/CharacteristicEditor';
//import DescriptorEditor from './components/DescriptorEditor';
//import KeyNavigation from '../common/TreeViewKeyNavigationMixin.jsx';
//import hotkey from 'react-hotkey';

//import {GattDatabases, GattDatabase, Service, Characteristic, Descriptor, Properties} from '../gattDatabases';

//const readProperties = new Properties(0x02);
//const notifyProperties = new Properties(0x10);
//const indicateProperties = new Properties(0x20);
//
//const readWriteProperties = new Properties(0x0A);
//const readNotifyProperties = new Properties(0x12);

export default class ServerSetup extends Component {
    //mixins: [KeyNavigation.mixin('gattDatabases', true)],
    constructor(props) {
        super(props);
    }

    _addService() {
        this.props.addNewService();
    }

    _addCharacteristic(parent) {
        this.props.addNewCharacteristic(parent);
    }

    _addDescriptor(parent) {
        this.props.addNewDescriptor(parent);
    }

    _onAttributeDeleted(attribute) {
        this.props.deleteAttribute(attribute);
    }

    render() {
        const {
            serverSetup,
            selectComponent,
            toggleAttributeExpanded,
            removeAttribute,
        } = this.props;

        const {
            selectedComponent,
            tempServer,
        } = serverSetup;

        instanceIds = getInstanceIds(selectedComponent);
        let selectedIsDescriptor = false;
        let selectedIsCharacteristic = false;
        let selectedIsService = false;

        if (instanceIds.descriptor) {
            selectedIsDescriptor = true;
        } else if (instanceIds.characteristic) {
            selectedIsCharacteristic = true;
        } else if (instanceIds.service) {
            selectedIsService = true;
        }

        const editor = selectedIsService ? <ServiceEditor service={selectedComponent} onAttributeDeleted={removeAttribute}/>
                     : selectedIsCharacteristic ? <CharacteristicEditor characteristic={selectedComponent} onAttributeDeleted={removeAttribute} />
                     : selectedIsDescriptor ? <DescriptorEditor descriptor={selectedComponent} onAttributeDeleted={removeAttribute}/>
                     : <div className='nothing-selected' />;

        const services = [];

        tempServer.children.forEach((service, i) => {
            services.push(
                <ServiceItem key={i}
                             item={service}
                             selectOnClick={true}
                             selected={selectedComponent}
                             onSelected={this._onSelected}
                             selectOnClick={true}
                             onSelectAttribute={selectComponent}
                             onToggleAttributeExpanded={toggleAttributeExpanded}
                             addNew={true}
                             addCharacteristic={() => this._addCharacteristic()}
                             addDescriptor={() => this._addDescriptor()} />
            );
        });

        return (
            <div className='server-setup' style={this.props.style}>
                <div className='server-setup-view'>
                    <div className='service-items-wrap'>
                        {services}
                        <AddNewItem text='New service' id='add-btn-root' bars={1} selected={selectedComponent} onClick={() => this._addService()} />
                    </div>
                    <div className='item-editor'>
                        {editor}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const selectedAdapter = state.adapter.adapters[state.adapter.selectedAdapter];

    if (!selectedAdapter) {
        return {};
    }

    return {
        serverSetup: selectedAdapter.serverSetup,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(ServerSetupActions, dispatch),
            bindActionCreators(AdapterActions, dispatch),
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ServerSetup);

ServerSetup.propTypes = {
    serverSetup: PropTypes.object,
};
