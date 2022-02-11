/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { dialog } from '@electron/remote';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as AdapterActions from '../actions/adapterActions';
import * as AdvertisingActions from '../actions/advertisingActions';
import * as ErrorActions from '../actions/errorDialogActions';
import * as ServerSetupActions from '../actions/serverSetupActions';
import {
    findSelectedItem,
    traverseItems,
} from '../common/treeViewKeyNavigation';
import AddNewItem from '../components/AddNewItem';
import CentralDevice from '../components/CentralDevice';
import CharacteristicEditor from '../components/CharacteristicEditor';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DescriptorEditor from '../components/DescriptorEditor';
import ServiceEditor from '../components/ServiceEditor';
import ServiceItem from '../components/ServiceItem';
import { getInstanceIds, ImmutableAdapter } from '../utils/api';
import withHotkey from '../utils/withHotkey';

const filters = [
    { name: 'nRF Connect Server Setup', extensions: ['ncs', 'json'] },
    { name: 'All Files', extensions: ['*'] },
];

class ServerSetup extends React.PureComponent {
    constructor(props) {
        super(props);

        this.moveUp = () => this.selectNextComponent(true);
        this.moveDown = () => this.selectNextComponent(false);
        this.moveRight = () => this.expandComponent(true);
        this.moveLeft = () => this.expandComponent(false);

        this.modified = false;
        this.pendingSelectInstanceId = null;

        this.openSaveDialog = this.openSaveDialog.bind(this);
        this.openLoadDialog = this.openLoadDialog.bind(this);
        this.saveChangedAttribute = this.saveChangedAttribute.bind(this);
        this.onModified = this.onModified.bind(this);
        this.onSelectComponent = this.onSelectComponent.bind(this);
        this.onClickApply = this.onClickApply.bind(this);
    }

    componentDidMount() {
        const { bindHotkey } = this.props;
        bindHotkey('up', this.moveUp);
        bindHotkey('down', this.moveDown);
        bindHotkey('left', this.moveLeft);
        bindHotkey('right', this.moveRight);
    }

    componentDidUpdate(prevProps) {
        const { serverSetup } = this.props;
        if (serverSetup) {
            return false;
        }

        if (!prevProps || !prevProps.serverSetup) {
            return false;
        }

        if (
            !serverSetup ||
            prevProps.serverSetup.selectedComponent !==
                serverSetup.selectedComponent
        ) {
            this.modified = false;
            return false;
        }

        return true;
    }

    onModified(value) {
        this.modified = value;
    }

    onSelectComponent(instanceId) {
        const { selectComponent } = this.props;
        if (!this.modified) {
            selectComponent(instanceId);
            return;
        }

        this.pendingSelectInstanceId = instanceId;
    }

    onClickApply() {
        const { selectedAdapter, applyServer, showApplyDialog } = this.props;
        if (!selectedAdapter.isServerSetupApplied) {
            applyServer();
        } else {
            showApplyDialog();
        }
    }

    openSaveDialog() {
        const { saveServerSetup } = this.props;
        dialog.showSaveDialog({ filters }).then(({ canceled, filePath }) => {
            if (!filePath || canceled) {
                return;
            }
            saveServerSetup(filePath);
        });
    }

    openLoadDialog() {
        const { loadServerSetup } = this.props;
        dialog
            .showOpenDialog({ filters, properties: ['openFile'] })
            .then(({ canceled, filePaths }) => {
                if (!filePaths || canceled) {
                    return;
                }
                const [filePath] = filePaths;
                if (!filePath) {
                    return;
                }
                loadServerSetup(filePath);
            });
    }

    selectNextComponent(backward) {
        const { serverSetup, selectComponent } = this.props;

        if (!serverSetup) {
            return;
        }

        const { selectedComponent } = serverSetup;
        const deviceDetails = new Map({
            devices: new Map({ 'local.server': serverSetup }),
        });
        let foundCurrent = false;

        // eslint-disable-next-line no-restricted-syntax
        for (const item of traverseItems(deviceDetails, true, backward)) {
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

    expandComponent(expand) {
        const { serverSetup, selectComponent, setAttributeExpanded } =
            this.props;

        const { selectedComponent } = serverSetup;
        const deviceDetails = new Map({
            devices: new Map({ 'local.server': serverSetup }),
        });

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
                    this.selectNextComponent(false);
                }

                return;
            }

            if (!expand && !item.expanded) {
                if (itemInstanceIds.characteristic) {
                    selectComponent(
                        selectedComponent.split('.').slice(0, -1).join('.')
                    );
                }

                return;
            }

            setAttributeExpanded(item, expand);
        }
    }

    saveChangedAttribute(changedAttribute) {
        const { saveChangedAttribute } = this.props;
        saveChangedAttribute(changedAttribute);
    }

    render() {
        const {
            selectedAdapter,
            serverSetup,
            toggleAdvertising,
            setAttributeExpanded,
            addNewService,
            addNewCharacteristic,
            addNewDescriptor,
            removeAttribute,
            resetAndApplyServer,
            clearServer,
            hideApplyDialog,
            showDeleteDialog,
            hideDeleteDialog,
            showClearDialog,
            hideClearDialog,
            showErrorDialog,
        } = this.props;

        if (!serverSetup) {
            return <div className="server-setup" />;
        }
        const {
            selectedComponent,
            showingApplyDialog,
            showingDeleteDialog,
            showingClearDialog,
            children,
        } = serverSetup;

        const instanceIds = getInstanceIds(selectedComponent);
        let selectedAttribute = null;
        let selectedIsDescriptor = false;
        let selectedIsCharacteristic = false;
        let selectedIsService = false;

        if (instanceIds.descriptor) {
            selectedAttribute = children.getIn([
                instanceIds.service,
                'children',
                instanceIds.characteristic,
                'children',
                instanceIds.descriptor,
            ]);
            selectedIsDescriptor = true;
        } else if (instanceIds.characteristic) {
            selectedAttribute = children.getIn([
                instanceIds.service,
                'children',
                instanceIds.characteristic,
            ]);
            selectedIsCharacteristic = true;
        } else if (instanceIds.service) {
            selectedAttribute = children.getIn([instanceIds.service]);
            selectedIsService = true;
        }

        const editorBorderClass = selectedAttribute
            ? ' selected-component-editor-border'
            : '';
        let editor = <div className="nothing-selected" />;
        if (selectedIsService) {
            editor = (
                <ServiceEditor
                    service={selectedAttribute}
                    onSaveChangedAttribute={this.saveChangedAttribute}
                    onRemoveAttribute={showDeleteDialog}
                    onModified={this.onModified}
                    onValidationError={error => showErrorDialog(error)}
                />
            );
        } else if (selectedIsCharacteristic) {
            editor = (
                <CharacteristicEditor
                    characteristic={selectedAttribute}
                    onSaveChangedAttribute={this.saveChangedAttribute}
                    onRemoveAttribute={showDeleteDialog}
                    onModified={this.onModified}
                    onValidationError={error => showErrorDialog(error)}
                />
            );
        } else if (selectedIsDescriptor) {
            editor = (
                <DescriptorEditor
                    descriptor={selectedAttribute}
                    onSaveChangedAttribute={this.saveChangedAttribute}
                    onRemoveAttribute={showDeleteDialog}
                    onModified={this.onModified}
                    onValidationError={error => showErrorDialog(error)}
                />
            );
        }

        const services = children.valueSeq().map((service, i) => {
            let canAdd = true;

            if (
                service.instanceId === 'local.server.0' ||
                service.instanceId === 'local.server.1'
            ) {
                canAdd = false;
            }

            const key = `${i}`;
            return (
                <ServiceItem
                    key={key}
                    item={service}
                    selectOnClick
                    selected={selectedComponent}
                    onSelectAttribute={this.onSelectComponent}
                    onSetAttributeExpanded={setAttributeExpanded}
                    addNew={canAdd}
                    onAddCharacteristic={addNewCharacteristic}
                    onAddDescriptor={addNewDescriptor}
                />
            );
        });

        const btnTitle = selectedAdapter.isServerSetupApplied
            ? 'Server setup can be applied only once between resets'
            : '';

        const central = (
            <CentralDevice
                id={`${selectedAdapter.instanceId}_serversetup`}
                name={selectedAdapter.state.name}
                address={selectedAdapter.state.address}
                onSaveSetup={this.openSaveDialog}
                onLoadSetup={this.openLoadDialog}
                advertising={selectedAdapter.state.advertising}
                onToggleAdvertising={toggleAdvertising}
            />
        );

        return (
            <div className="server-setup">
                <div className="server-setup-view">
                    <div className="server-setup-tree">
                        {central}
                        <div className="service-items-wrap">
                            {services}
                            <AddNewItem
                                text="New service"
                                id="add-btn-root"
                                bars={1}
                                parentInstanceId="local.server"
                                selected={selectedComponent}
                                onClick={addNewService}
                            />
                        </div>
                        <div className="server-setup-buttons">
                            <button
                                type="button"
                                className="btn btn-primary btn-nordic"
                                onClick={this.onClickApply}
                            >
                                <span className="mdi mdi-check" /> Apply to
                                device
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-nordic"
                                title={btnTitle}
                                onClick={showClearDialog}
                            >
                                <span className="mdi mdi-trash-can" /> Clear
                            </button>
                        </div>
                    </div>
                    <div className={`item-editor${editorBorderClass}`}>
                        {editor}
                    </div>
                    <ConfirmationDialog
                        show={showingApplyDialog}
                        onOk={resetAndApplyServer}
                        onCancel={hideApplyDialog}
                        text="The device must be reset before applying the server setup again.
                        All active Bluetooth connections will be lost.
                        Are you sure you want to apply?"
                        okButtonText="Yes"
                        cancelButtonText="No"
                    />
                    <ConfirmationDialog
                        show={showingDeleteDialog}
                        onOk={removeAttribute}
                        onCancel={hideDeleteDialog}
                        text="Are you sure you want to delete the attribute?"
                        okButtonText="Yes"
                        cancelButtonText="No"
                    />
                    <ConfirmationDialog
                        show={showingClearDialog}
                        onOk={clearServer}
                        onCancel={hideClearDialog}
                        text="Are you sure you want to clear the server setup?"
                        okButtonText="Yes"
                        cancelButtonText="No"
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { adapter } = state.app;

    const { selectedAdapter } = adapter;

    if (!selectedAdapter) {
        return {};
    }

    return {
        selectedAdapter,
        serverSetup: selectedAdapter.serverSetup,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = {
        ...bindActionCreators(ServerSetupActions, dispatch),
        ...bindActionCreators(AdapterActions, dispatch),
        ...bindActionCreators(AdvertisingActions, dispatch),
        ...bindActionCreators(ErrorActions, dispatch),
    };

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withHotkey(ServerSetup));

ServerSetup.propTypes = {
    selectedAdapter: PropTypes.instanceOf(ImmutableAdapter),
    serverSetup: PropTypes.object,
    saveServerSetup: PropTypes.func.isRequired,
    loadServerSetup: PropTypes.func.isRequired,
    selectComponent: PropTypes.func.isRequired,
    setAttributeExpanded: PropTypes.func.isRequired,
    saveChangedAttribute: PropTypes.func.isRequired,
    addNewService: PropTypes.func.isRequired,
    addNewCharacteristic: PropTypes.func.isRequired,
    addNewDescriptor: PropTypes.func.isRequired,
    removeAttribute: PropTypes.func.isRequired,
    applyServer: PropTypes.func.isRequired,
    resetAndApplyServer: PropTypes.func.isRequired,
    clearServer: PropTypes.func.isRequired,
    showApplyDialog: PropTypes.func.isRequired,
    hideApplyDialog: PropTypes.func.isRequired,
    showDeleteDialog: PropTypes.func.isRequired,
    hideDeleteDialog: PropTypes.func.isRequired,
    showClearDialog: PropTypes.func.isRequired,
    hideClearDialog: PropTypes.func.isRequired,
    showErrorDialog: PropTypes.func.isRequired,
    toggleAdvertising: PropTypes.func,
    bindHotkey: PropTypes.func.isRequired,
};

ServerSetup.defaultProps = {
    selectedAdapter: null,
    serverSetup: null,
    toggleAdvertising: null,
};
