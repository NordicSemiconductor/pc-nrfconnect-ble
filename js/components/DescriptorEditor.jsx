'use strict';

import React from 'react';
import Component from 'react-pure-render/component';

import { Input } from 'react-bootstrap';

import HexOnlyEditableField from './HexOnlyEditableField.jsx';

import { getUuidName } from '../utils/uuid_definitions';

const SUCCESS = 'success';
const WARNING = 'warning';
const ERROR = 'error';

export default class DescriptorEditor extends Component {
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
            return;
        }

        // TODO: Check max length vs initial value length.
        const changedDescriptor = {
            instanceId: this.props.descriptor.instanceId,
            uuid: this.uuid.toUpperCase().trim(),
            name: this.name,
            value: this._parseValueProperty(this.value),
            maxLengthActive: this.maxLengthActive,
            maxLength: parseInt(this.maxLength),
        };

        this.props.onSaveChangedAttribute(changedDescriptor);
        this.saved = true;
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
            maxLengthActive,
            maxLength,
        } = descriptor;

        if (this.saved || this.instanceId !== instanceId) {
            this.saved = false;
            this.instanceId = instanceId;
            this.uuid = uuid;
            this.name = name;
            this.value = value.toArray();

            this.maxLengthActive = maxLengthActive;
            this.maxLength = maxLength;
        }

        console.log('renderrerer');
        console.log(maxLengthActive);
        console.log(this.maxLengthActive);

        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label htmlFor='uuid' className='col-md-3 control-label'>Descriptor UUID</label>
                    <div className='col-md-9'>
                        <Input type='text' className='form-control' name='uuid' value={this.uuid} onChange={e => this._onUuidChange(e)} hasFeedback bsStyle={this.validateUuidInput()} />
                    </div>
                </div>
                <div className='form-group'>
                    <label htmlFor='service-name' className='col-md-3 control-label'>Descriptor name</label>
                    <div className='col-md-9'>
                        <input type='text' className='form-control' name='descriptor-name' value={this.name} onChange={e => this._setValueProperty('name', e)} />
                    </div>
                </div>

                <div className='form-group'>
                    <label htmlFor='initial-value' className='col-md-3 control-label'>Initial value</label>
                    <div className='col-md-9'>
                        <HexOnlyEditableField plain={true} className='form-control' name='initial-value' value={this.value} onChange={value => this._setInitialValue(value)} />
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Max length</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' ref='maxLengthActive' checked={this.maxLengthActive} onChange={e => this._setCheckedProperty('maxLengthActive', e)} />Activate</label></div>
                    </div>

                    <div className='col-md-offset-3 col-md-9'>
                        <input type='number' min='0' max='510' disabled={!this.maxLengthActive} className='form-control' name='max-length' ref='maxLength' value={this.maxLengthActive ? this.maxLength : ''} onChange={e => this._setValueProperty('maxLength', e)} />
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
