'use strict';

import React from 'react';
import Component from 'react-pure-render/component';

import { getUuidName } from '../utils/uuid_definitions';

export default class ServiceEditor extends Component{
    //mixins: [ReactLinkedStateMixin],
    constructor(props) {
        super(props);
    }

    _showDeleteConfirmation() {
        //this.setState({showConfirmDialog: true});
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

        this.forceUpdate();
    }

    _onNameChange(e) {
        this.name = e.target.value;
        this.forceUpdate();
    }

    _saveAttribute() {
        // TODO: Add verification?
        console.log('save');
        console.log(this.uuid);
        console.log(this.name);

        const changedService = {
            instanceId: this.props.service.instanceId,
            uuid: this.uuid.toUpperCase(),
            name: this.name,
        };

        this.props.onSaveChangedAttribute(changedService);
        this.saved = true;
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
        <form className='form-horizontal'>
          <div className='form-group'>
            <label htmlFor='uuid' className='col-md-3 control-label'>UUID</label>
            <div className='col-md-9'>
              <input ref={'uuidInput'} type='text' className='form-control' name='uuid' value={this.uuid} onChange={e => this._onUuidChange(e)} />
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='service-name' className='col-md-3 control-label'>Service name</label>
            <div className='col-md-9'>
              <input type='text' className='form-control' name='service-name' value={this.name} onChange={e => this._onNameChange(e)} />
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
};
