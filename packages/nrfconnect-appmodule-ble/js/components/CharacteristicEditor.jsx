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

import { ButtonToolbar, Button, Checkbox } from 'react-bootstrap';
import { TextInput, SelectList, LabeledInputGroup } from 'nrfconnect-core';
import UuidInput from './input/UuidInput';

import HexOnlyEditableField from './HexOnlyEditableField.jsx';

import { getUuidName, uuidCharacteristicDefinitions, TEXT, getUuidFormat } from '../utils/uuid_definitions';
import { ValidationError } from '../common/Errors';

import { ERROR, SUCCESS, validateUuid } from '../utils/validateUuid';

export default class CharacteristicEditor extends React.PureComponent {
    //mixins: [ReactLinkedStateMixin],
    constructor(props) {
        super(props);
    }

    validateValueLength() {
        const maxLength = parseInt(this.maxLength);
        const fixedLength = this.fixedLength;
        const value = this._parseValueProperty(this.value);

        if (maxLength > 510 && fixedLength === true) { return ERROR; }

        if (maxLength > 512 && fixedLength === false) { return ERROR; }

        if (maxLength < value.length) { return ERROR; }

        return SUCCESS;
    }

    _setCheckedProperty(property, e) {
        this[property] = e.target.checked;
        this.forceUpdate();
        this.props.onModified(true);
    }

    _setValueProperty(property, e) {
        this[property] = e.target.value;
        this.forceUpdate();
        this.props.onModified(true);
    }

    _parseValueProperty(value) {
        if (value.length === 0) {
            return [];
        }

        if (typeof value === 'string') {
            const valueArray = value.split(' ');
            return valueArray.map(value => parseInt(value, 16));
        }

        return this.value;
    }

    _setInitialValue(value) {
        this.value = value;
        this.forceUpdate();
        this.props.onModified(true);
    }

    _onUuidChange(e) {
        const _hexRegEx = /^[0-9A-F]*$/i;
        const textarea = e.target;
        const uuid = textarea.value;
        const valid = _hexRegEx.test(uuid);
        let caretPosition = textarea.selectionStart;

        if (!valid) {
            caretPosition--;
            this.forceUpdate(() => textarea.setSelectionRange(caretPosition, caretPosition));
            return;
        }

        this.uuid = uuid;
        let uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.forceUpdate(() => textarea.setSelectionRange(caretPosition, caretPosition));
        this.props.onModified(true);
    }

    _saveAttribute() {
        if (validateUuid(this.uuid) === ERROR) {
            this.props.onValidationError(new ValidationError('You have to provide a valid UUID.'));
            return;
        }

        if (this.validateValueLength() === ERROR) {
            this.props.onValidationError(new ValidationError('Length of value is not valid.'));
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
            instanceId: this.props.characteristic.instanceId,
            uuid: this.uuid.toUpperCase().trim(),
            name: this.name,
            value: this._parseValueProperty(this.value),
            properties: changedProperties,
            readPerm: this.readPerm,
            writePerm: this.writePerm,
            fixedLength: this.fixedLength,
            maxLength: parseInt(this.maxLength),
        };

        this.props.onSaveChangedAttribute(changedCharacteristic);
        this.saved = true;
        this.props.onModified(false);
    }

    _handleUuidSelect(uuid) {
        this.uuid = uuid;
        let uuidName = getUuidName(this.uuid);

        if (this.uuid !== uuidName) {
            this.name = uuidName;
        }

        this.forceUpdate();
        this.props.onModified(true);
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
            this.uuid = uuid;
            this.name = name;
            this.value = value.toArray();

            this.broadcast = broadcast;
            this.read = read;
            this.writeWoResp = writeWoResp;
            this.write = write;
            this.notify = notify;
            this.indicate = indicate;
            this.authSignedWr = authSignedWr;
            this.reliableWr = reliableWr;
            this.wrAux = wrAux;

            this.readPerm = readPerm;
            this.writePerm = writePerm;
            this.fixedLength = fixedLength;
            this.maxLength = maxLength;
        }

        const showText = getUuidFormat(this.uuid) === TEXT;

        return (
            <form className='form-horizontal native-key-bindings'>
                <UuidInput label='Characteristic UUID' name='uuid' value={this.uuid}
                    onChange={e => this._onUuidChange(e)} uuidDefinitions={uuidCharacteristicDefinitions}
                    handleSelection={uuid => this._handleUuidSelect(uuid)} />

                <TextInput label='Characteristic name' name='characteristic-name' value={this.name} onChange={e => this._setValueProperty('name', e)} />
                <HexOnlyEditableField label='Initial value' plain={true} className='form-control' name='initial-value' value={this.value}
                    onChange={value => this._setInitialValue(value)} showText={showText} />

                <LabeledInputGroup label='Properties'>
                    <Checkbox ref='broadcast' checked={this.broadcast} onChange={e => this._setCheckedProperty('broadcast', e)}>Broadcast</Checkbox>
                    <Checkbox ref='read' checked={this.read} onChange={e => this._setCheckedProperty('read', e)}>Read</Checkbox>
                    <Checkbox ref='writeWithoutResponse' checked={this.writeWoResp} onChange={e => this._setCheckedProperty('writeWoResp', e)}>Write without response</Checkbox>
                    <Checkbox ref='write' checked={this.write} onChange={e => this._setCheckedProperty('write', e)}>Write</Checkbox>
                    <Checkbox ref='notify' checked={this.notify} onChange={e => this._setCheckedProperty('notify', e)}>Notify</Checkbox>
                    <Checkbox ref='indicate' checked={this.indicate} onChange={e => this._setCheckedProperty('indicate', e)}>Indicate</Checkbox>
                    <Checkbox ref='authenticatedSignedWrites' checked={this.authSignedWr} onChange={e => this._setCheckedProperty('authSignedWr', e)}>
                        Authenticated signed write
                    </Checkbox>
                </LabeledInputGroup>

                <LabeledInputGroup label='Extended Properties'>
                    <Checkbox ref='reliableWrite' checked={this.reliableWr} onChange={e => this._setCheckedProperty('reliableWr', e)}>Reliable write</Checkbox>
                    <Checkbox ref='writeAuxiliary' checked={this.wrAux} onChange={e => this._setCheckedProperty('wrAux', e)}>Write auxiliary</Checkbox>
                </LabeledInputGroup>

                <SelectList label='Read permission' type='select' className='form-control' value={this.readPerm} onChange={e => this._setValueProperty('readPerm', e)}>
                    <option value='open'>No security required</option>
                    <option value='encrypt'>Encryption required, no MITM</option>
                    <option value='encrypt mitm-protection'>Encryption with MITM required</option>
                    <option value='lesc'>LESC encryption with MITM required</option>
                    <option value='no_access'>No access rights specified (undefined)</option>
                </SelectList>

                <SelectList label='Write permission' type='select' className='form-control' value={this.writePerm} onChange={e => this._setValueProperty('writePerm', e)}>
                    <option value='open'>No security required</option>
                    <option value='encrypt'>Encryption required, no MITM</option>
                    <option value='encrypt mitm-protection'>Encryption with MITM required</option>
                    <option value='lesc'>LESC encryption with MITM required</option>
                    <option value='no_access'>No access rights specified (undefined)</option>
                </SelectList>

                <LabeledInputGroup label='Max length'>
                    <Checkbox ref='fixedLength' checked={this.fixedLength} onChange={e => this._setCheckedProperty('fixedLength', e)}>Fixed length</Checkbox>
                    <TextInput inline type='number' min='0' max={this.fixedLength ? '510' : '512'} name='max-length' ref='maxLength' value={this.maxLength}
                        onChange={e => this._setValueProperty('maxLength', e)} />
                </LabeledInputGroup>

                <ButtonToolbar>
                    <div className='col-md-4' />
                    <Button bsStyle='primary' className='btn-nordic' onClick={onRemoveAttribute}><i className='icon-cancel'/>Delete</Button>
                    <Button bsStyle='primary' className='btn-nordic' onClick={() => this._saveAttribute()}>Save</Button>
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
};
