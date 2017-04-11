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

/* eslint react/forbid-prop-types: off */
/* eslint react/prop-types: off */

'use strict';

import React, { PropTypes } from 'react';

import { ButtonToolbar, Button, Checkbox } from 'react-bootstrap';
import TextInput from './input/TextInput';
import SelectList from './input/SelectList';
import LabeledInputGroup from './input/LabeledInputGroup';
import UuidInput from './input/UuidInput';

import HexOnlyEditableField from './HexOnlyEditableField';

import { getUuidName, uuidDescriptorDefinitions } from '../utils/uuid_definitions';
import { ValidationError } from '../common/Errors';

import { ERROR, SUCCESS, validateUuid } from '../utils/validateUuid';

class DescriptorEditor extends React.PureComponent {
    validateUuidInput() {
        return validateUuid(this.uuid);
    }

    validateValueLength() {
        const maxLength = parseInt(this.maxLength, 10);
        const fixedLength = this.fixedLength;
        const value = this.LparseValueProperty(this.value);

        if (maxLength > 510 && fixedLength === true) { return ERROR; }

        if (maxLength > 512 && fixedLength === false) { return ERROR; }

        if (maxLength < value.length) { return ERROR; }

        return SUCCESS;
    }

    LsetCheckedProperty(property, e) {
        this[property] = e.target.checked;
        this.forceUpdate();
        this.props.onModified(true);
    }

    LsetValueProperty(property, e) {
        this[property] = e.target.value;
        this.forceUpdate();
        this.props.onModified(true);
    }

    LparseValueProperty(value) {
        if (value.length === 0) {
            return [];
        }

        if (typeof value === 'string') {
            const valueArray = value.split(' ');
            return valueArray.map(val => parseInt(val, 16));
        }

        return this.value;
    }

    LsetInitialValue(value) {
        this.value = value;
        this.forceUpdate();
        this.props.onModified(true);
    }

    LonUuidChange(uuid) {
        const hexRegEx = /^[0-9A-F]*$/i;
        const valid = hexRegEx.test(uuid);
        let caretPosition = textarea.selectionStart;

        if (!valid) {
            caretPosition -= 1;
            this.forceUpdate(() => textarea.setSelectionRange(caretPosition, caretPosition));
            return;
        }

        this.uuid = uuid;
        const uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.forceUpdate(() => textarea.setSelectionRange(caretPosition, caretPosition));
        this.props.onModified(true);
    }

    LsaveAttribute() {
        if (this.validateUuidInput() === ERROR) {
            this.props.onValidationError(new ValidationError('You have to provide a valid UUID.'));
            return;
        }

        if (this.validateValueLength() === ERROR) {
            this.props.onValidationError(new ValidationError('Length of value is not valid.'));
            return;
        }

        const changedDescriptor = {
            instanceId: this.props.descriptor.instanceId,
            uuid: this.uuid.toUpperCase().trim(),
            name: this.name,
            value: this.LparseValueProperty(this.value),
            readPerm: this.readPerm,
            writePerm: this.writePerm,
            fixedLength: this.fixedLength,
            maxLength: parseInt(this.maxLength, 10),
        };

        this.props.onSaveChangedAttribute(changedDescriptor);
        this.saved = true;
        this.props.onModified(false);
    }

    LhandleUuidSelect(uuid) {
        this.uuid = uuid;
        const uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.forceUpdate();
        this.props.onModified(true);
    }

    render() {
        const {
            descriptor,
            onRemoveAttribute,
        } = this.props;

        const {
            instanceId,
            uuid,
            name,
            value,
            readPerm,
            writePerm,
            fixedLength,
            maxLength,
        } = descriptor;

        if (this.saved || this.instanceId !== instanceId) {
            this.saved = false;
            this.instanceId = instanceId;
            this.uuid = uuid || '';
            this.name = name;
            this.value = value.toArray();

            this.readPerm = readPerm;
            this.writePerm = writePerm;
            this.fixedLength = fixedLength === true;
            this.maxLength = maxLength;
        }

        return (
            <form className="form-horizontal native-key-bindings">
                <UuidInput
                    label="Descriptor UUID"
                    name="uuid"
                    value={this.uuid}
                    onChange={e => this.LonUuidChange(e.target.value)}
                    uuidDefinitions={uuidDescriptorDefinitions}
                    handleSelection={uuid2 => this.LhandleUuidSelect(uuid2)}
                />

                <TextInput
                    label="Descriptor name"
                    name="descriptor-name"
                    value={this.name}
                    onChange={e => this.LsetValueProperty('name', e)}
                />
                <HexOnlyEditableField
                    label="Initial value"
                    plain
                    className="form-control" name="initial-value" value={this.value}
                    onChange={val => this.LsetInitialValue(val)}
                    labelClassName="col-md-3"
                    wrapperClassName="col-md-9"
                />

                <SelectList
                    label="Read permission"
                    type="select"
                    className="form-control"
                    value={this.readPerm}
                    onChange={e => this.LsetValueProperty('readPerm', e)}
                >
                    <option value="open">No security required</option>
                    <option value="encrypt">Encryption required, no MITM</option>
                    <option value="encrypt mitm-protection">Encryption and MITM required</option>
                    <option value="signed">Signing or encryption required, no MITM</option>
                    <option value="signed mitm-protection">
                        Signing or encryption with MITM required
                    </option>
                    <option value="no_access">No access rights specified (undefined)</option>
                </SelectList>

                <SelectList
                    label="Write permission"
                    type="select"
                    className="form-control"
                    value={this.writePerm}
                    onChange={e => this.LsetValueProperty('writePerm', e)}
                >
                    <option value="open">No security required</option>
                    <option value="encrypt">Encryption required, no MITM</option>
                    <option value="encrypt mitm-protection">Encryption and MITM required</option>
                    <option value="signed">Signing or encryption required, no MITM</option>
                    <option value="signed mitm-protection">
                        Signing or encryption with MITM required
                    </option>
                    <option value="no_access">No access rights specified (undefined)</option>
                </SelectList>

                <LabeledInputGroup label="Max length">
                    <Checkbox checked={this.fixedLength} onChange={e => this.LsetCheckedProperty('fixedLength', e)}>Fixed length</Checkbox>
                    <TextInput
                        inline
                        type="number"
                        min={0}
                        max={this.fixedLength ? 510 : 512}
                        name="max-length"
                        value={this.maxLength}
                        onChange={e => this.LsetValueProperty('maxLength', e)}
                    />
                </LabeledInputGroup>

                <ButtonToolbar>
                    <div className="col-md-4" />
                    <Button bsStyle="primary" className="btn-nordic" onClick={onRemoveAttribute}>
                        <i className="icon-cancel" />Delete
                    </Button>
                    <Button
                        bsStyle="primary"
                        className="btn-nordic"
                        onClick={() => this.LsaveAttribute()}
                    >
                        Save
                    </Button>
                </ButtonToolbar>
            </form>
        );
    }
}

DescriptorEditor.propTypes = {
    descriptor: PropTypes.object.isRequired,
    onRemoveAttribute: PropTypes.func.isRequired,
    onSaveChangedAttribute: PropTypes.func.isRequired,
    onValidationError: PropTypes.func.isRequired,
};

export default DescriptorEditor;
