'use strict';

import React, {PropTypes} from 'react';
import Component from 'react-pure-render/component';

import {DropdownButton} from 'react-bootstrap';
import {MenuItem} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {Input} from 'react-bootstrap';

export default class AdvertisingData extends Component {
    constructor(props) {
        super(props);
        this.value = '';
        this.type = null;
        this.typeApi = null;
        this.typeKey = null;
        this.title = 'Advertising data type';
    }

    keyToAdvertisingType(key) {
        switch (key) {
            case '0':
                return 'Complete local name';
            case '1':
                return 'Shortened local name';
            case '2':
                return 'UUID 16 bit complete list';
            case '3':
                return 'UUID 16 bit more available';
            case '4':
                return 'UUID 128 bit complete list';
            case '5':
                return 'UUID 128 bit more available';
            case '6':
                return 'TX power level';
            case '7':
                return 'Custom AD type';
        }
    }

    keyToApiAdvType(key) {
        switch (key) {
            case '0':
                return 'completeLocalName';
            case '1':
                return 'shortenedLocalName';
            case '2':
                return 'completeListOf16BitServiceUuids';
            case '3':
                return 'incompleteListOf16BitServiceUuids';
            case '4':
                return 'completeListOf128BitServiceUuids';
            case '5':
                return 'incompleteListOf128BitServiceUuids';
            case '6':
                return 'txPowerLevel';
            case '7':
                return 'custom';
            default:
                return 'unknown';
        }
    }

    handleSelect(event, eventKey) {
        console.log(`SELECTED: ${eventKey}`);
        this.typeKey = eventKey;
        this.title = this.keyToAdvertisingType(eventKey);
        this.forceUpdate();

        this.type = this.keyToAdvertisingType(this.typeKey);
        this.typeApi = this.keyToApiAdvType(this.typeKey);
        this.emitValueChange();
    }

    handleChange(event) {
        this.value = event.target.value;
        this.forceUpdate();
        this.emitValueChange();
    }

    emitValueChange() {
        const typeValue = {
            typeKey: this.typeKey,
            type: this.type,
            typeApi: this.typeApi,
            value: this.value,
        };
        this.props.onValueChange(typeValue);
    }

    validationState() {
        const length = this.value.length;
        if (length > 23) {
            return 'error';
        } else if (length > 0) {
            return 'success';
        }
    }

    render() {
        const {
            onValueChange,
        } = this.props;

        return (
            <div>
                <div className='adv-drop-container'>
                    <DropdownButton className='adv-dropdown' title={this.title} id='dropdown-adv'
                            onSelect={(event, eventKey) => this.handleSelect(event, eventKey)}>
                        <MenuItem eventKey='0'>{this.keyToAdvertisingType('0')}</MenuItem>
                        <MenuItem eventKey='1'>{this.keyToAdvertisingType('1')}</MenuItem>
                        <MenuItem eventKey='2'>{this.keyToAdvertisingType('2')}</MenuItem>
                        <MenuItem eventKey='3'>{this.keyToAdvertisingType('3')}</MenuItem>
                        <MenuItem eventKey='4'>{this.keyToAdvertisingType('4')}</MenuItem>
                        <MenuItem eventKey='5'>{this.keyToAdvertisingType('5')}</MenuItem>
                        <MenuItem eventKey='6'>{this.keyToAdvertisingType('6')}</MenuItem>
                        <MenuItem eventKey='7'>{this.keyToAdvertisingType('7')}</MenuItem>
                    </DropdownButton>
                </div>
                <div className='adv-value-container'>
                    <span>Value: </span>
                    <Input
                        type='text'
                        id='value'
                        placeholder='Enter value'
                        bsStyle={this.validationState()}
                        onChange={event => this.handleChange(event)} />
                    <span> (string)</span>
                </div>
            </div>
        );
    }
}

AdvertisingData.propTypes = {
    onValueChange: PropTypes.func.isRequired,
};
