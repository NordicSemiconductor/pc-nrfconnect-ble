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

import { ButtonToolbar, Button } from 'react-bootstrap';
import { TextInput } from 'nrfconnect-core';
import UuidInput from './input/UuidInput';

import { getUuidName, uuidServiceDefinitions } from '../utils/uuid_definitions';

import { ValidationError } from '../common/Errors';
import { ERROR, validateUuid } from '../utils/validateUuid';

export default class ServiceEditor extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    _handleUuidSelect(uuid) {
        this._onUuidChange(uuid);
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
            this.uuid = uuid || '';
            this.name = name;
        }

        return (
            <form className='form-horizontal native-key-bindings'>
                <UuidInput label='Service UUID' name='uuid' value={this.uuid}
                    onChange={e => this._onUuidChange(e)} uuidDefinitions={uuidServiceDefinitions}
                    handleSelection={uuid => this._handleUuidSelect(uuid)} />
                <TextInput label='Service name' name='service-name' value={this.name} onChange={e => this._onNameChange(e)} />
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
