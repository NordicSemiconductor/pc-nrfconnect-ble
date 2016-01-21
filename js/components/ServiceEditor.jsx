'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { Input } from 'react-bootstrap';

import { getUuidName } from '../utils/uuid_definitions';
import { ValidationError } from '../common/Errors';

const SUCCESS = 'success';
const ERROR = 'error';

export default class ServiceEditor extends Component{
    constructor(props) {
        super(props);
    }

    validateUuidInput() {
        const uuid16regex = /^[0-9a-fA-F]{4}$/;
        const uuid128regex = /^[0-9a-fA-F]{32}$/;

        return uuid16regex.test(this.uuid) || uuid128regex.test(this.uuid) ? SUCCESS : ERROR;
    }

    _onUuidChange(e) {
        const _hexRegEx = /^[0-9A-F]*$/i;
        const uuid = e.target.value;
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
          <div className='form-group'>
            <label htmlFor='uuid' className='col-md-3 control-label'>Service UUID</label>
            <div className='col-md-9'>
              <Input type='text' className='form-control' name='uuid' value={this.uuid} onChange={e => this._onUuidChange(e)} hasFeedback bsStyle={this.validateUuidInput()} />
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='service-name' className='col-md-3 control-label'>Service name</label>
            <div className='col-md-9'>
              <Input type='text' className='form-control' name='service-name' value={this.name} onChange={e => this._onNameChange(e)} />
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

ServiceEditor.propTypes = {
    service: PropTypes.object.isRequired,
    onRemoveAttribute: PropTypes.func.isRequired,
    onSaveChangedAttribute: PropTypes.func.isRequired,
    onValidationError: PropTypes.func.isRequired,
};
