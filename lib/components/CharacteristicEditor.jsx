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
import FormCheck from 'react-bootstrap/FormCheck';

import { ValidationError } from '../common/Errors';
import {
    TEXT,
    getUuidFormat,
    getUuidName,
    uuidCharacteristicDefinitions,
} from '../utils/uuid_definitions';
import { ERROR, SUCCESS, validateUuid } from '../utils/validateUuid';
import HexOnlyEditableField from './HexOnlyEditableField';
import LabeledInputGroup from './input/LabeledInputGroup';
import SelectList from './input/SelectList';
import TextInput from './input/TextInput';
import UuidInput from './input/UuidInput';

class CharacteristicEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleUuidSelect = this.handleUuidSelect.bind(this);
        this.setInitialValue = this.setInitialValue.bind(this);
        this.saveAttribute = this.saveAttribute.bind(this);
    }

    setCheckedProperty(property, e) {
        const { onModified } = this.props;
        this[property] = e.target.checked;
        this.forceUpdate();
        onModified(true);
    }

    setInitialValue(value) {
        const { onModified } = this.props;
        this.value = value;
        this.forceUpdate();
        onModified(true);
    }

    setValueProperty(property, e) {
        const { onModified } = this.props;
        this[property] = e.target.value;
        this.forceUpdate();
        onModified(true);
    }

    validateValueLength() {
        const maxLength = parseInt(this.maxLength, 10);
        const { fixedLength } = this;
        const value = this.parseValueProperty(this.value);

        if (maxLength > 510 && fixedLength === true) { return ERROR; }

        if (maxLength > 512 && fixedLength === false) { return ERROR; }

        if (maxLength < value.length) { return ERROR; }

        return SUCCESS;
    }

    parseValueProperty(value) {
        if (value.length === 0) {
            return [];
        }

        if (typeof value === 'string') {
            const valueArray = value.split(' ');
            return valueArray.map(val => parseInt(val, 16));
        }

        return this.value;
    }

    saveAttribute() {
        const {
            characteristic, onValidationError, onSaveChangedAttribute, onModified,
        } = this.props;
        if (validateUuid(this.uuid) === ERROR) {
            onValidationError(new ValidationError('You have to provide a valid UUID.'));
            return;
        }

        if (this.validateValueLength() === ERROR) {
            onValidationError(new ValidationError('Length of value is not valid.'));
            return;
        }

        const changedProperties = {
            broadcast: this.broadcast,
            read: this.read,
            writeWoResp: this.writeWoResp,
            write: this.write,
            notify: this.notify,
            indicate: this.indicate,
            authSignedWr: this.authSignedWr,
            reliableWr: this.reliableWr,
            wrAux: this.wrAux,
        };

        const changedCharacteristic = {
            instanceId: characteristic.instanceId,
            uuid: this.uuid.toUpperCase().trim(),
            name: this.name,
            value: this.parseValueProperty(this.value),
            properties: changedProperties,
            readPerm: this.readPerm,
            writePerm: this.writePerm,
            fixedLength: this.fixedLength,
            maxLength: parseInt(this.maxLength, 10),
        };

        onSaveChangedAttribute(changedCharacteristic);
        this.saved = true;
        onModified(false);
    }

    handleUuidSelect(uuid) {
        const { onModified } = this.props;
        this.uuid = uuid;
        const uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.forceUpdate();
        onModified(true);
    }

    render() {
        const {
            characteristic,
            onRemoveAttribute,
        } = this.props;

        const {
            instanceId,
            uuid,
            name,
            properties,
            value,
            readPerm,
            writePerm,
            fixedLength,
            maxLength,
        } = characteristic;

        const {
            broadcast,
            read,
            writeWoResp,
            write,
            notify,
            indicate,
            authSignedWr,
            reliableWr,
            wrAux,
        } = properties;

        if (this.saved || this.instanceId !== instanceId) {
            this.saved = false;
            this.instanceId = instanceId;
            this.uuid = uuid || '';
            this.name = name;
            this.value = value.toArray();

            this.broadcast = broadcast === true;
            this.read = read === true;
            this.writeWoResp = writeWoResp === true;
            this.write = write === true;
            this.notify = notify === true;
            this.indicate = indicate === true;
            this.authSignedWr = authSignedWr === true;
            this.reliableWr = reliableWr === true;
            this.wrAux = wrAux === true;

            this.readPerm = readPerm;
            this.writePerm = writePerm;
            this.fixedLength = fixedLength === true;
            this.maxLength = maxLength;
        }

        const showText = getUuidFormat(this.uuid) === TEXT;

        return (
            <form className="form-horizontal native-key-bindings">
                <UuidInput
                    label="Characteristic UUID"
                    name="uuid"
                    value={this.uuid}
                    uuidDefinitions={uuidCharacteristicDefinitions}
                    handleSelection={this.handleUuidSelect}
                />

                <TextInput
                    label="Characteristic name"
                    name="characteristic-name"
                    value={this.name}
                    onChange={e => this.setValueProperty('name', e)}
                />

                <HexOnlyEditableField
                    label="Initial value"
                    plain
                    className="form-control"
                    name="initial-value"
                    value={this.value}
                    onChange={this.setInitialValue}
                    showText={showText}
                />

                <LabeledInputGroup label="Properties">
                    <FormCheck checked={this.broadcast} onChange={e => this.setCheckedProperty('broadcast', e)}>Broadcast</FormCheck>
                    <FormCheck checked={this.read} onChange={e => this.setCheckedProperty('read', e)}>Read</FormCheck>
                    <FormCheck checked={this.writeWoResp} onChange={e => this.setCheckedProperty('writeWoResp', e)}>Write without response</FormCheck>
                    <FormCheck checked={this.write} onChange={e => this.setCheckedProperty('write', e)}>Write</FormCheck>
                    <FormCheck checked={this.notify} onChange={e => this.setCheckedProperty('notify', e)}>Notify</FormCheck>
                    <FormCheck checked={this.indicate} onChange={e => this.setCheckedProperty('indicate', e)}>Indicate</FormCheck>
                    <FormCheck checked={this.authSignedWr} onChange={e => this.setCheckedProperty('authSignedWr', e)}>
                        Authenticated signed write
                    </FormCheck>
                </LabeledInputGroup>

                <LabeledInputGroup label="Extended Properties">
                    <FormCheck checked={this.reliableWr} onChange={e => this.setCheckedProperty('reliableWr', e)}>Reliable write</FormCheck>
                    <FormCheck checked={this.wrAux} onChange={e => this.setCheckedProperty('wrAux', e)}>Write auxiliary</FormCheck>
                </LabeledInputGroup>

                <SelectList label="Read permission" type="select" className="form-control" value={this.readPerm} onChange={e => this.setValueProperty('readPerm', e)}>
                    <option value="open">No security required</option>
                    <option value="encrypt">Encryption required, no MITM</option>
                    <option value="encrypt mitm-protection">Encryption with MITM required</option>
                    <option value="lesc">LESC encryption with MITM required</option>
                    <option value="no_access">No access rights specified (undefined)</option>
                </SelectList>

                <SelectList label="Write permission" type="select" className="form-control" value={this.writePerm} onChange={e => this.setValueProperty('writePerm', e)}>
                    <option value="open">No security required</option>
                    <option value="encrypt">Encryption required, no MITM</option>
                    <option value="encrypt mitm-protection">Encryption with MITM required</option>
                    <option value="lesc">LESC encryption with MITM required</option>
                    <option value="no_access">No access rights specified (undefined)</option>
                </SelectList>

                <LabeledInputGroup label="Max length">
                    <FormCheck checked={this.fixedLength} onChange={e => this.setCheckedProperty('fixedLength', e)}>Fixed length</FormCheck>
                    <TextInput
                        inline
                        type="number"
                        min={0}
                        max={this.fixedLength ? 510 : 512}
                        name="max-length"
                        value={this.maxLength}
                        onChange={e => this.setValueProperty('maxLength', e)}
                    />
                </LabeledInputGroup>

                <ButtonToolbar>
                    <div className="col-md-4" />
                    <Button variant="primary" className="btn-nordic" onClick={onRemoveAttribute}>
                        <i className="icon-cancel" />
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

CharacteristicEditor.propTypes = {
    characteristic: PropTypes.object.isRequired,
    onRemoveAttribute: PropTypes.func.isRequired,
    onSaveChangedAttribute: PropTypes.func.isRequired,
    onValidationError: PropTypes.func.isRequired,
    onModified: PropTypes.func.isRequired,
};

export default CharacteristicEditor;
