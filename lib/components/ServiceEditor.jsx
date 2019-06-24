/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

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
            onValidationError(new ValidationError('You have to provide a valid UUID.'));
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
                    <Button variant="primary" className="btn-nordic" onClick={onRemoveAttribute}>
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
