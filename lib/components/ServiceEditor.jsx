/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import PropTypes from 'prop-types';

import { ValidationError } from '../common/Errors';
import { getUuidName, uuidServiceDefinitions } from '../utils/uuid_definitions';
import { ERROR, validateUuid } from '../utils/validateUuid';
import TextInput from './input/TextInput';
import UuidInput from './input/UuidInput';

class ServiceEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onNameChange = this.onNameChange.bind(this);
        this.handleUuidSelect = this.handleUuidSelect.bind(this);
        this.saveAttribute = this.saveAttribute.bind(this);
    }

    onNameChange(e) {
        const { onModified } = this.props;
        this.name = e.target.value;
        onModified(true);
        this.forceUpdate();
    }

    handleUuidSelect(uuid) {
        const { onModified } = this.props;
        this.uuid = uuid;
        const uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        onModified(true);

        this.forceUpdate();
    }

    saveAttribute() {
        const {
            service,
            onValidationError,
            onSaveChangedAttribute,
            onModified,
        } = this.props;
        if (validateUuid(this.uuid) === ERROR) {
            onValidationError(
                new ValidationError('You have to provide a valid UUID.')
            );
            return;
        }

        const changedService = {
            instanceId: service.instanceId,
            uuid: this.uuid.toUpperCase().trim(),
            name: this.name,
        };

        onSaveChangedAttribute(changedService);
        this.saved = true;
        onModified(false);
    }

    render() {
        const { service, onRemoveAttribute } = this.props;

        const { instanceId, uuid, name } = service;

        if (this.saved || this.instanceId !== instanceId) {
            this.saved = false;
            this.instanceId = instanceId;
            this.uuid = uuid || '';
            this.name = name;
        }

        return (
            <form className="form-horizontal native-key-bindings">
                <UuidInput
                    label="Service UUID"
                    name="uuid"
                    value={this.uuid}
                    uuidDefinitions={uuidServiceDefinitions}
                    handleSelection={this.handleUuidSelect}
                />
                <TextInput
                    label="Service name"
                    name="service-name"
                    value={this.name}
                    onChange={this.onNameChange}
                />
                <ButtonToolbar>
                    <div className="col-md-4" />
                    <Button
                        variant="primary"
                        className="btn-nordic"
                        onClick={onRemoveAttribute}
                    >
                        <i className="mdi mdi-close" />
                        Delete
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-nordic"
                        onClick={this.saveAttribute}
                    >
                        Save
                    </Button>
                </ButtonToolbar>
            </form>
        );
    }
}

ServiceEditor.propTypes = {
    service: PropTypes.object.isRequired,
    onRemoveAttribute: PropTypes.func.isRequired,
    onSaveChangedAttribute: PropTypes.func.isRequired,
    onValidationError: PropTypes.func.isRequired,
    onModified: PropTypes.func.isRequired,
};

export default ServiceEditor;
