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
import CharacteristicEditor from '../components/CharacteristicEditor';
import DescriptorEditor from '../components/DescriptorEditor';

import ConfirmationDialog from '../components/ConfirmationDialog';

import { getInstanceIds } from '../utils/api';

class ServerSetup extends Component {
    //mixins: [KeyNavigation.mixin('gattDatabases', true)],
    constructor(props) {
        super(props);
    }

    _saveChangedAttribute(changedAttribute) {
        this.props.saveChangedAttribute(changedAttribute);
    }

    _applyServer() {
        this.props.applyServer();
    }

    render() {
        const {
            serverSetup,
            selectComponent,
            toggleAttributeExpanded,
            addNewService,
            addNewCharacteristic,
            addNewDescriptor,
            removeAttribute,
            showDeleteConfirmationDialog,
            hideDeleteConfirmationDialog,
        } = this.props;

        if (!serverSetup) {
            return (<div className='server-setup' style={this.props.style} />);
        }

        const {
            selectedComponent,
            showDeleteDialog,
            children,
        } = serverSetup;

        instanceIds = getInstanceIds(selectedComponent);
        let selectedAttribute = null;
        let selectedIsDescriptor = false;
        let selectedIsCharacteristic = false;
        let selectedIsService = false;

        if (instanceIds.descriptor) {
            selectedAttribute = children.getIn([
                instanceIds.service, 'children',
                instanceIds.characteristic, 'children',
                instanceIds.descriptor,
            ]);
            selectedIsDescriptor = true;
        } else if (instanceIds.characteristic) {
            selectedAttribute = children.getIn([
                instanceIds.service, 'children',
                instanceIds.characteristic,
            ]);
            selectedIsCharacteristic = true;
        } else if (instanceIds.service) {
            selectedAttribute = children.getIn([instanceIds.service]);
            selectedIsService = true;
        }

        const editorBorderClass = selectedAttribute ? ' selected-component-editor-border' : '';
        const editor = selectedIsService ? <ServiceEditor service={selectedAttribute}
                                                          onSaveChangedAttribute={changedAttribute => this._saveChangedAttribute(changedAttribute)}
                                                          onRemoveAttribute={showDeleteConfirmationDialog} />
                     : selectedIsCharacteristic ? <CharacteristicEditor characteristic={selectedAttribute}
                                                                        onSaveChangedAttribute={changedAttribute => this._saveChangedAttribute(changedAttribute)}
                                                                        onRemoveAttribute={showDeleteConfirmationDialog} />
                     : selectedIsDescriptor ? <DescriptorEditor descriptor={selectedAttribute}
                                                                onSaveChangedAttribute={changedAttribute => this._saveChangedAttribute(changedAttribute)}
                                                                onRemoveAttribute={showDeleteConfirmationDialog} />
                     : <div className='nothing-selected' />;

        const services = [];

        children.forEach((service, i) => {
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
                             onAddCharacteristic={addNewCharacteristic}
                             onAddDescriptor={addNewDescriptor} />
            );
        });

        return (
            <div className='server-setup' style={this.props.style}>
                <div className='server-setup-view'>
                    <div className='server-setup-tree'>
                        <div className='service-items-wrap'>
                            {services}
                            <AddNewItem text='New service' id='add-btn-root' bars={1} parentInstanceId={'local.server'} selected={selectedComponent} onClick={addNewService} />
                        </div>
                        <div className='server-setup-buttons'>
                            <button type='button' className='btn btn-primary btn-nordic' onClick={() => this._applyServer()}>Apply</button>
                            <button type='button' className='btn btn-primary btn-nordic' onClick={() => this._newServer()}>New server</button>
                        </div>
                    </div>
                    <div className={'item-editor' + editorBorderClass}>
                        {editor}
                    </div>
                    <ConfirmationDialog show={showDeleteDialog}
                                        onOk={removeAttribute}
                                        onCancel={hideDeleteConfirmationDialog}
                                        text='Do you want to delete?'/>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const selectedAdapter = state.adapter.getIn(['adapters', state.adapter.selectedAdapter]);

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
