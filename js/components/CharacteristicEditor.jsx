'use strict';

import React from 'react';
import Component from 'react-pure-render/component';

import _ from 'underscore';
import HexOnlyEditableField from './HexOnlyEditableField.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';

export default class CharacteristicEditor extends Component {
    //mixins: [ReactLinkedStateMixin],
    constructor(props) {
        super(props);
    }

    _showDeleteConfirmation() {
        //this.setState({showConfirmDialog: true});
    }

    render() {
        const {
            characteristic,
            onRemoveAttribute,
        } = this.props;

        const {
            uuid,
            name,
            properties,
            value,
            maxLengthActive,
            maxLength,
            security,
            readAuthorization,
            writeAuthorization,
        } = characteristic;

        const {
            broadcast,
            read,
            writeWithoutResponse,
            write,
            notify,
            indicate,
            authenticatedSignedWrites,
            reliableWrite,
            writeAuxiliary,
        } = properties;

        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label htmlFor='uuid' className='col-md-3 control-label'>UUID</label>
                    <div className='col-md-9'>
                        <input type='text' className='form-control' name='uuid' value={uuid}/>
                    </div>
                </div>
                <div className='form-group'>
                    <label htmlFor='characteristic-name' className='col-md-3 control-label'>Characteristic name</label>
                    <div className='col-md-9'>
                        <input type='text' className='form-control' name='characteristic-name' value={name}/>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Properties</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' checked={broadcast}/> Broadcast </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={read}/> Read </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={writeWithoutResponse}/> Write without response</label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={write}/> Write </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={notify}/> Notify </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={indicate}/> Indicate </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={authenticatedSignedWrites}/> Authenticated signed write </label></div>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Extended properties</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' checked={reliableWrite}/> Reliable write </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={writeAuxiliary}/> Write auxiliary </label></div>
                    </div>
                </div>

                <div className='form-group'>
                    <label htmlFor='initial-value' className='col-md-3 control-label'>Initial value</label>
                    <div className='col-md-9'>
                        {/*<HexOnlyEditableField plain={true} className='form-control' name='initial-value' value={value}/>*/}
                        <input type='text' className='form-control' name='initial-value' value={value}/>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Max length</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' checked={maxLengthActive} />Activate</label></div>
                    </div>

                    <div className='col-md-offset-3 col-md-9'>
                        <input type='number' min='0' disabled={!maxLengthActive} className='form-control' name='max-length' value={maxLength}/>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Security</label>
                    <div className='col-md-9'>
                        <select className='form-control' value={'open'}>
                            <option value='open'>No security required</option>
                            <option value='enc_no_mitm'>Encryption required, no MITM</option>
                            <option value='enc_with_mitm'>Encryption and MITM required</option>
                            <option value='signed_no_mitm'>Signing or encryption required, no MITM</option>
                            <option value='signed_with_mitm'>Signing or encryption with MITM required</option>
                            <option value='no_access'>No access rights specified (undefined)</option>
                        </select>
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Authorization</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' checked={readAuthorization}/> Read authorization required </label></div>
                        <div className='checkbox'><label><input type='checkbox' checked={writeAuthorization}/> Write authorization required </label></div>
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
