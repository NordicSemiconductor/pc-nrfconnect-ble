'use strict';

import React from 'react';
import Component from 'react-pure-render/component';

import _ from 'underscore';
import HexOnlyEditableField from './HexOnlyEditableField.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';

export default class DescriptorEditor extends Component {
    //mixins: [ReactLinkedStateMixin],
    constructor(props) {
        super(props);
    }

    _showDeleteConfirmation() {
        //this.setState({showConfirmDialog: true});
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

        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label htmlFor='uuid' className='col-md-3 control-label'>Descriptor UUID</label>
                    <div className='col-md-9'>
                        <input type='text' className='form-control' name='uuid' value={uuid} />
                    </div>
                </div>
                <div className='form-group'>
                    <label htmlFor='service-name' className='col-md-3 control-label'>Descriptor name</label>
                    <div className='col-md-9'>
                        <input type='text' className='form-control' name='service-name' value={name} />
                    </div>
                </div>

                <div className='form-group'>
                    <label htmlFor='initial-value' className='col-md-3 control-label'>Initial value</label>
                    <div className='col-md-9'>
                        <HexOnlyEditableField plain={true} className='form-control' name='initial-value' value={value} />
                    </div>
                </div>

                <div className='form-group'>
                    <label className='col-md-3 control-label'>Max length</label>
                    <div className='col-md-9'>
                        <div className='checkbox'><label><input type='checkbox' checkedLink={maxLengthActive}/> Activate</label></div>
                    </div>

                    <div className='col-md-offset-3 col-md-9'>
                        <input type='number' min='0' disabled={!maxLengthActive} className='form-control' name='max-length' valueLink={maxLength} />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-md-offset-3 col-md-9 padded-row'>
                        <button type='button' className='btn btn-primary'>Save</button>
                        <button type='button' className='btn btn-primary' onClick={onRemoveAttribute}>Delete</button>
                    </div>
                </div>
            </form>
        );
    }
}
