/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React, { PropTypes } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { ipcRenderer } from 'electron';

import * as ServerSetupActions from '../actions/serverSetupActions';
import * as AdapterActions from '../actions/adapterActions';
import * as ErrorActions from '../actions/errorDialogActions';

import AddNewItem from '../components/AddNewItem';
import ServiceItem from '../components/ServiceItem';
import ServiceEditor from '../components/ServiceEditor';
import CharacteristicEditor from '../components/CharacteristicEditor';
import DescriptorEditor from '../components/DescriptorEditor';
import ConfirmationDialog from '../components/ConfirmationDialog';
import CentralDevice from '../components/CentralDevice';

import { getInstanceIds } from '../utils/api';
import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';

let loadServerSetupReplyHandle;
let saveServerSetupReplyHandle;

class ServerSetup extends React.PureComponent {
    constructor(props) {
        super(props);

        this._setupFileDialogs();

        this.moveUp = () => this._selectNextComponent(true);
        this.moveDown = () => this._selectNextComponent(false);
        this.moveRight = () => this._expandComponent(true);
        this.moveLeft = () => this._expandComponent(false);

        this.modified = false;
        this.pendingSelectInstanceId = null;
    }

    componentDidMount() {
        this._registerKeyboardShortcuts();
    }

    componentWillUnmount() {
        this._unregisterKeyboardShortcuts();
    }

    componentWillUpdate(nextProps, nextState) {
        if (!this.props.serverSetup) { return false; }

        if (!nextProps || !nextProps.serverSetup) { return false; }

        if (!this.props.serverSetup ||
            nextProps.serverSetup.selectedComponent !== this.props.serverSetup.selectedComponent) {
            this.modified = false;
        }
    }

    _registerKeyboardShortcuts() {
        window.addEventListener('core:move-down', this.moveDown);
        window.addEventListener('core:move-up', this.moveUp);
        window.addEventListener('core:move-right', this.moveRight);
        window.addEventListener('core:move-left', this.moveLeft);
    }

    _unregisterKeyboardShortcuts() {
        window.removeEventListener('core:move-down', this.moveDown);
        window.removeEventListener('core:move-up', this.moveUp);
        window.removeEventListener('core:move-right', this.moveRight);
        window.removeEventListener('core:move-left', this.moveLeft);
    }

    _selectNextComponent(backward) {
        const {
            serverSetup,
            selectComponent,
        } = this.props;

        if (!serverSetup) {
            return;
        }

        const selectedComponent = serverSetup.selectedComponent;
        const deviceDetails = new Map({ devices: new Map({ 'local.server': serverSetup }) });
        let foundCurrent = false;

        for (let item of traverseItems(deviceDetails, true, backward)) {
            if (selectedComponent === null) {
                if (item !== null) {
                    selectComponent(item.instanceId);
                    return;
                }
            }

            if (item.instanceId === selectedComponent) {
                foundCurrent = true;
            } else if (foundCurrent) {
                selectComponent(item.instanceId);
                return;
            }
        }
    }

    _expandComponent(expand) {
        const {
            serverSetup,
            selectComponent,
            setAttributeExpanded,
        } = this.props;

        const selectedComponent = serverSetup.selectedComponent;
        const deviceDetails = new Map({ devices: new Map({ 'local.server': serverSetup }) });

        if (!selectedComponent) {
            return;
        }

        const itemInstanceIds = getInstanceIds(selectedComponent);
        if (expand && itemInstanceIds.descriptor) {
            return;
        }

        const item = findSelectedItem(deviceDetails, selectedComponent);

        if (item) {
            if (expand && item.expanded && item.children.size) {
                if (item.children.size) {
                    this._selectNextComponent(false);
                }

                return;
            }

            if (!expand && !item.expanded) {
                if (itemInstanceIds.characteristic) {
                    selectComponent(selectedComponent.split('.').slice(0, -1).join('.'));
                }

                return;
            }

            setAttributeExpanded(item, expand);
        }
    }

    _setupFileDialogs() {
        const {
            loadServerSetup,
            saveServerSetup,
        } = this.props;

        if (loadServerSetupReplyHandle) {
            ipcRenderer.removeListener('load-server-setup-reply', loadServerSetupReplyHandle);
        }

        const loadServerSetupReply = (event, filename) => {
            loadServerSetup(filename);
        };

        ipcRenderer.on('load-server-setup-reply', loadServerSetupReply);
        loadServerSetupReplyHandle = loadServerSetupReply;

        if (saveServerSetupReplyHandle) {
            ipcRenderer.removeListener('save-server-setup-reply', saveServerSetupReplyHandle);
        }

        const saveServerSetupReply = (event, filename) => {
            saveServerSetup(filename);
        };

        ipcRenderer.on('save-server-setup-reply', saveServerSetupReply);
        saveServerSetupReplyHandle = saveServerSetupReply;
    }

    _saveChangedAttribute(changedAttribute) {
        this.props.saveChangedAttribute(changedAttribute);
    }

    _onModified(value) {
        this.modified = value;
    }

    _onSelectComponent(instanceId) {
        if (!this.modified) {
            this.props.selectComponent(instanceId);
            return;
        }

        this.pendingSelectInstanceId = instanceId;
        this.props.showDiscardDialog();
    }

    _onDiscardCancel() {
        this.pendingSelectInstanceId = null;

        this.props.hideDiscardDialog();
    }

    _onDiscardOk() {
        this.props.hideDiscardDialog();
        this.props.selectComponent(this.pendingSelectInstanceId);
    }

    render() {
        const {
            selectedAdapter,
            serverSetup,
            selectComponent,
            setAttributeExpanded,
            addNewService,
            addNewCharacteristic,
            addNewDescriptor,
            removeAttribute,
            applyServer,
            clearServer,
            showDeleteDialog,
            hideDeleteDialog,
            showClearDialog,
            hideClearDialog,
            showErrorDialog,
            showDiscardDialog,
            hideDiscardDialog,
        } = this.props;

        if (!serverSetup) {
            return (<div className='server-setup' style={this.props.style} />);
        }

        const {
            selectedComponent,
            showingDeleteDialog,
            showingClearDialog,
            showingDiscardDialog,
            children,
        } = serverSetup;

        const instanceIds = getInstanceIds(selectedComponent);
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
                                                          onRemoveAttribute={showDeleteDialog}
                                                          onModified={modified => this._onModified(modified)}
                                                          onValidationError={error => showErrorDialog(error)} />
                     : selectedIsCharacteristic ? <CharacteristicEditor characteristic={selectedAttribute}
                                                                        onSaveChangedAttribute={changedAttribute => this._saveChangedAttribute(changedAttribute)}
                                                                        onRemoveAttribute={showDeleteDialog}
                                                                        onModified={modified => this._onModified(modified)}
                                                                        onValidationError={error => showErrorDialog(error)} />
                     : selectedIsDescriptor ? <DescriptorEditor descriptor={selectedAttribute}
                                                                onSaveChangedAttribute={changedAttribute => this._saveChangedAttribute(changedAttribute)}
                                                                onRemoveAttribute={showDeleteDialog}
                                                                onModified={modified => this._onModified(modified)}
                                                                onValidationError={error => showErrorDialog(error)} />
                     : <div className='nothing-selected' />;

        const services = children.map((service, i) => {
            let canAdd = true;

            if (service.instanceId === 'local.server.0' || service.instanceId === 'local.server.1') {
                canAdd = false;
            }

            return <ServiceItem
                            key={i}
                            item={service}
                            selectOnClick={true}
                            selected={selectedComponent}
                            onSelected={this._onSelected}
                            onSelectAttribute={instanceId => this._onSelectComponent(instanceId)}
                            onSetAttributeExpanded={setAttributeExpanded}
                            addNew={canAdd}
                            onAddCharacteristic={addNewCharacteristic}
                            onAddDescriptor={addNewDescriptor} />
            ;
        });

        const btnTitle = selectedAdapter.isServerSetupApplied ? 'Server setup can be applied only once between resets' : '';

        const central = <CentralDevice id={selectedAdapter.instanceId + '_serversetup'}
            name={selectedAdapter.state.name}
            address={selectedAdapter.state.address}
            onSaveSetup={() => {
                ipcRenderer.send('save-server-setup', null);
            }}

            onLoadSetup={() => {
                ipcRenderer.send('load-server-setup', null);
            }}

         />;

        return (
            <div className='server-setup' style={this.props.style}>
                <div className='server-setup-view'>
                    <div className='server-setup-tree'>
                        {central}
                        <div className='service-items-wrap'>
                            {services}
                            <AddNewItem text='New service' id='add-btn-root' bars={1} parentInstanceId={'local.server'} selected={selectedComponent} onClick={addNewService} />
                        </div>
                        <div className='server-setup-buttons'>
                            <button type='button' className='btn btn-primary btn-nordic'
                                disabled={selectedAdapter.isServerSetupApplied} title={btnTitle}
                                onClick={applyServer}><i className='icon-ok' /> Apply to device</button>
                            <button type='button' className='btn btn-primary btn-nordic' onClick={showClearDialog}><i className='icon-trash' /> Clear</button>
                        </div>
                    </div>
                    <div className={'item-editor' + editorBorderClass}>
                        {editor}
                    </div>
                    <ConfirmationDialog show={showingDeleteDialog}
                                        onOk={removeAttribute}
                                        onCancel={hideDeleteDialog}
                                        text='Are you sure you want to delete the attribute?'/>
                    <ConfirmationDialog show={showingClearDialog}
                                        onOk={clearServer}
                                        onCancel={hideClearDialog}
                                        text='Are you sure you want to clear the server setup?'/>
                    <ConfirmationDialog show={showingDiscardDialog}
                                        onOk={() => this._onDiscardOk()}
                                        onCancel={() => this._onDiscardCancel()}
                                        text='The attribute has been modified. Discard the changes?' />
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
        selectedAdapter: selectedAdapter,
        serverSetup: selectedAdapter.serverSetup,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(ServerSetupActions, dispatch),
            bindActionCreators(AdapterActions, dispatch),
            bindActionCreators(ErrorActions, dispatch)
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
