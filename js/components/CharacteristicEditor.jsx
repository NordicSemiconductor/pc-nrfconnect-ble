'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { Input } from 'react-bootstrap';

import HexOnlyEditableField from './HexOnlyEditableField.jsx';

import { getUuidName } from '../utils/uuid_definitions';
import { ValidationError } from '../common/Errors';

const SUCCESS = 'success';
const WARNING = 'warning';
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

    _setCheckedProperty(property, e) {
        this[property] = e.target.checked;
        this.forceUpdate();
    }

    _setValueProperty(property, e) {
        this[property] = e.target.value;
        this.forceUpdate();
    }

    _parseValueProperty(value) {
        if (typeof value === 'string') {
            const valueArray = value.split('-');
            return valueArray.map(value => parseInt(value, 16));
        }

        return this.value;
    }

    _setInitialValue(value) {
        this.value = value;
        this.forceUpdate();
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
    }

    _saveAttribute() {
        // TODO: Add verification?
        if (this.validateUuidInput() === ERROR) {
            this.props.onValidationError(new ValidationError('You have to provide a valid UUID.'));
            return;
        }

        // TODO: Check max length vs initial value length.

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
                    <div className='col-md-9'>
                        <Input type='text' className='form-control' name='uuid' value={this.uuid} onChange={e => this._onUuidChange(e)} hasFeedback bsStyle={this.validateUuidInput()} />
                    </div>
                </div>
                <div className='form-group'>
                    <label htmlFor='characteristic-name' className='col-md-3 control-label'>Characteristic name</label>
                    <div className='col-md-9'>
                        <input type='text' className='form-control' name='characteristic-name' value={this.name} onChange={e => this._setValueProperty('name', e)} />
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
                        <div className='checkbox'><label><input type='checkbox' ref='broadcast' checked={this.broadcast} onChange={e => this._setCheckedProperty('broadcast', e)} /> Broadcast </label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='read' checked={this.read} onChange={e => this._setCheckedProperty('read', e)} /> Read </label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='writeWithoutResponse' checked={this.write_wo_resp} onChange={e => this._setCheckedProperty('write_wo_resp', e)} /> Write without response</label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='write' checked={this.write} onChange={e => this._setCheckedProperty('write', e)} /> Write </label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='notify' checked={this.notify} onChange={e => this._setCheckedProperty('notify', e)} /> Notify </label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='indicate' checked={this.indicate} onChange={e => this._setCheckedProperty('indicate', e)} /> Indicate </label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='authenticatedSignedWrites' checked={this.auth_signed_wr} onChange={e => this._setCheckedProperty('auth_signed_wr', e)} /> Authenticated signed write </label></div>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Extended properties</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' ref='reliableWrite' checked={this.reliable_wr} onChange={e => this._setCheckedProperty('reliable_wr', e)} /> Reliable write </label></div>
                        <div className='checkbox'><label><input type='checkbox' ref='writeAuxiliary' checked={this.wr_aux} onChange={e => this._setCheckedProperty('wr_aux', e)} /> Write auxiliary </label></div>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Read permission</label>
                    <div className='col-md-9'>
                        <select className='form-control' value={this.readPerm} onChange={e => this._setValueProperty('readPerm', e)}>
                            <option value='open'>No security required</option>
                            <option value='encrypt'>Encryption required, no MITM</option>
                            <option value='encrypt mitm-protection'>Encryption and MITM required</option>
                            <option value='signed'>Signing or encryption required, no MITM</option>
                            <option value='signed mitm-protection'>Signing or encryption with MITM required</option>
                            <option value='no_access'>No access rights specified (undefined)</option>
                        </select>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Write permission</label>
                    <div className='col-md-9'>
                        <select className='form-control' value={this.writePerm} onChange={e => this._setValueProperty('writePerm', e)}>
                            <option value='open'>No security required</option>
                            <option value='encrypt'>Encryption required, no MITM</option>
                            <option value='encrypt mitm-protection'>Encryption and MITM required</option>
                            <option value='signed'>Signing or encryption required, no MITM</option>
                            <option value='signed mitm-protection'>Signing or encryption with MITM required</option>
                            <option value='no_access'>No access rights specified (undefined)</option>
                        </select>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Max length</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' ref='fixedLength' checked={this.fixedLength} onChange={e => this._setCheckedProperty('fixedLength', e)} />Fixed length</label></div>
                    </div>

                    <div className='col-md-offset-3 col-md-9'>
                        <input type='number' min='0' max={this.fixedLength ? '510' : '512'} className='form-control' name='max-length' ref='maxLength' value={this.maxLength} onChange={e => this._setValueProperty('maxLength', e)} />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-md-offset-3 col-md-9 padded-row'>
                        <button type='button' className='btn btn-primary' onClick={() => this._saveAttribute()}>Save</button>
                        <button type='button' className='btn btn-primary' onClick={onRemoveAttribute}>Delete</button>
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
