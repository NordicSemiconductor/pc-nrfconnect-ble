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

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { ButtonToolbar, Button } from 'react-bootstrap';

import { uuidServiceDefinitions } from '../utils/uuid_definitions';
import { getUuidName } from '../utils/uuid_definitions';
import { ValidationError } from '../common/Errors';

import SetupInput from './input/SetupInput';
import SetupUuidInput from './input/SetupUuidInput';
import { ERROR, validateUuid } from '../utils/validateUuid';

export default class ServiceEditor extends Component{
    constructor(props) {
        super(props);
    }

    handleUuidSelect(event, eventKey) {
        this._onUuidChange(eventKey);
    }

    validateUuidInput() {
        return validateUuid(this.uuid);
    }

    _onUuidChange(uuid) {
        const _hexRegEx = /^[0-9A-F]*$/i;
        const valid = _hexRegEx.test(uuid);

        if (!valid) {
            return;
        }

        this.uuid = uuid;
        let uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.props.onModified(true);

        this.forceUpdate();
    }

    _onNameChange(e) {
        this.name = e.target.value;
        this.props.onModified(true);
        this.forceUpdate();
    }

    _saveAttribute() {
        if (this.validateUuidInput() === ERROR) {
            this.props.onValidationError(new ValidationError('You have to provide a valid UUID.'));
            return;
        }

        const changedService = {
            instanceId: this.props.service.instanceId,
            uuid: this.uuid.toUpperCase().trim(),
            name: this.name,
        };

        this.props.onSaveChangedAttribute(changedService);
        this.saved = true;
        this.props.onModified(false);
    }

    render() {
        const {
            service,
            onRemoveAttribute,
        } = this.props;

        const {
            instanceId,
            uuid,
            name,
        } = service;

        if (this.saved || this.instanceId !== instanceId) {
            this.saved = false;
            this.instanceId = instanceId;
            this.uuid = uuid;
            this.name = name;
        }

        return (
            <form className='form-horizontal native-key-bindings'>
                <SetupUuidInput label='Service UUID' name='uuid' value={this.uuid}
                    onChange={e => this._onUuidChange(e)} uuidDefinitions={uuidServiceDefinitions}
                    handleSelection={uuid => this._handleUuidSelect(uuid)} />
                <SetupInput label='Service name' type='text' name='service-name' value={this.name} onChange={e => this._onNameChange(e)} />
                <ButtonToolbar>
                    <div className='col-md-4' />
                    <Button bsStyle='primary' className='btn-nordic' onClick={onRemoveAttribute}><i className='icon-cancel'/>Delete</Button>
                    <Button bsStyle='primary' className='btn-nordic' onClick={() => this._saveAttribute()}>Save</Button>
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
};
