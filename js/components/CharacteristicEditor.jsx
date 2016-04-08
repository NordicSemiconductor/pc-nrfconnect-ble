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

import { Input } from 'react-bootstrap';

import HexOnlyEditableField from './HexOnlyEditableField.jsx';
import UuidLookup from '../components/UuidLookup';

import { uuidCharacteristicDefinitions } from '../utils/uuid_definitions';
import { getUuidName } from '../utils/uuid_definitions';
import { ValidationError } from '../common/Errors';

const SUCCESS = 'success';
const ERROR = 'error';

export default class CharacteristicEditor extends Component {
    //mixins: [ReactLinkedStateMixin],
    constructor(props) {
        super(props);
    }

    validateUuidInput() {
        const uuid16regex = /^[0-9a-fA-F]{4}$/;
        const uuid128regex = /^[0-9a-fA-F]{32}$/;

        return uuid16regex.test(this.uuid) || uuid128regex.test(this.uuid) ? SUCCESS : ERROR;
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
            const valueArray = value.split('-');
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
        if (this.validateUuidInput() === ERROR) {
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
            write_wo_resp: this.write_wo_resp,
            write: this.write,
            notify: this.notify,
            indicate: this.indicate,
            auth_signed_wr: this.auth_signed_wr,
            reliable_wr: this.reliable_wr,
            wr_aux: this.wr_aux,
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

    _handleUuidSelect(event, eventKey) {
        this.uuid = eventKey;
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
            write_wo_resp,
            write,
            notify,
            indicate,
            auth_signed_wr,
            reliable_wr,
            wr_aux,
        } = properties;

        if (this.saved || this.instanceId !== instanceId) {
            this.saved = false;
            this.instanceId = instanceId;
            this.uuid = uuid;
            this.name = name;
            this.value = value.toArray();

            this.broadcast = broadcast;
            this.read = read;
            this.write_wo_resp = write_wo_resp;
            this.write = write;
            this.notify = notify;
            this.indicate = indicate;
            this.auth_signed_wr = auth_signed_wr;
            this.reliable_wr = reliable_wr;
            this.wr_aux = wr_aux;

            this.readPerm = readPerm;
            this.writePerm = writePerm;
            this.fixedLength = fixedLength;
            this.maxLength = maxLength;
        }

        return (
            <form className='form-horizontal native-key-bindings'>
                <div className='form-group'>
                    <label htmlFor='uuid' className='col-md-3 control-label'>Characteristic UUID</label>
                    <div className='col-md-7 uuid-input'>
                        <Input type='text' className='form-control' name='uuid' value={this.uuid} onChange={e => this._onUuidChange(e)} hasFeedback bsStyle={this.validateUuidInput()} />
                    </div>
                    <div className='col-md-1'>
                        <UuidLookup onSelect={(event, eventKey) => this._handleUuidSelect(event, eventKey)}
                            title={'Predefined characteristic UUIDs'} uuidDefs={uuidCharacteristicDefinitions} pullRight={true}/>
                    </div>
                </div>
                <div className='form-group'>
                    <label htmlFor='characteristic-name' className='col-md-3 control-label'>Characteristic name</label>
                    <div className='col-md-9'>
                        <Input type='text' className='form-control' name='characteristic-name' value={this.name} onChange={e => this._setValueProperty('name', e)} />
                    </div>
                </div>

                <div className='form-group'>
                    <label htmlFor='initial-value' className='col-md-3 control-label'>Initial value</label>
                    <div className='col-md-9'>
                        <HexOnlyEditableField plain={true} className='form-control' name='initial-value' value={this.value} onChange={value => this._setInitialValue(value)} />
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Properties</label>
                    <div className='col-md-9'>
                        <Input type='checkbox' ref='broadcast' checked={this.broadcast} onChange={e => this._setCheckedProperty('broadcast', e)} label='Broadcast' />
                        <Input type='checkbox' ref='read' checked={this.read} onChange={e => this._setCheckedProperty('read', e)} label='Read' />
                        <Input type='checkbox' ref='writeWithoutResponse' checked={this.write_wo_resp} onChange={e => this._setCheckedProperty('write_wo_resp', e)} label='Write without response' />
                        <Input type='checkbox' ref='write' checked={this.write} onChange={e => this._setCheckedProperty('write', e)} label='Write' />
                        <Input type='checkbox' ref='notify' checked={this.notify} onChange={e => this._setCheckedProperty('notify', e)} label='Notify' />
                        <Input type='checkbox' ref='indicate' checked={this.indicate} onChange={e => this._setCheckedProperty('indicate', e)} label='Indicate' />
                        <Input type='checkbox' ref='authenticatedSignedWrites' checked={this.auth_signed_wr} onChange={e => this._setCheckedProperty('auth_signed_wr', e)} label='Authenticated signed write' />
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Extended properties</label>
                    <div className='col-md-9'>
                        <Input type='checkbox' ref='reliableWrite' checked={this.reliable_wr} onChange={e => this._setCheckedProperty('reliable_wr', e)} label='Reliable write'/>
                        <Input type='checkbox' ref='writeAuxiliary' checked={this.wr_aux} onChange={e => this._setCheckedProperty('wr_aux', e)} label='Write auxiliary'/>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Read permission</label>
                    <div className='col-md-9'>
                        <Input type='select' className='form-control' value={this.readPerm} onChange={e => this._setValueProperty('readPerm', e)}>
                            <option value='open'>No security required</option>
                            <option value='encrypt'>Encryption required, no MITM</option>
                            <option value='encrypt mitm-protection'>Encryption and MITM required</option>
                            <option value='signed'>Signing or encryption required, no MITM</option>
                            <option value='signed mitm-protection'>Signing or encryption with MITM required</option>
                            <option value='no_access'>No access rights specified (undefined)</option>
                        </Input>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Write permission</label>
                    <div className='col-md-9'>
                        <Input type='select' className='form-control' value={this.writePerm} onChange={e => this._setValueProperty('writePerm', e)}>
                            <option value='open'>No security required</option>
                            <option value='encrypt'>Encryption required, no MITM</option>
                            <option value='encrypt mitm-protection'>Encryption and MITM required</option>
                            <option value='signed'>Signing or encryption required, no MITM</option>
                            <option value='signed mitm-protection'>Signing or encryption with MITM required</option>
                            <option value='no_access'>No access rights specified (undefined)</option>
                        </Input>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Max length</label>
                    <div className='col-md-9'>
                        <Input type='checkbox' ref='fixedLength' checked={this.fixedLength} onChange={e => this._setCheckedProperty('fixedLength', e)} label='Fixed length' />
                    </div>

                    <div className='col-md-offset-3 col-md-9'>
                        <Input type='number' min='0' max={this.fixedLength ? '510' : '512'} className='form-control' name='max-length' ref='maxLength' value={this.maxLength} onChange={e => this._setValueProperty('maxLength', e)} />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-md-offset-3 col-md-9 padded-row'>
                        <button type='button' className='btn btn-primary btn-nordic' onClick={onRemoveAttribute}><i className='icon-cancel'/> Delete</button>
                        <button type='button' className='btn btn-primary btn-nordic' onClick={() => this._saveAttribute()}>Save</button>
                    </div>
                </div>
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
