'use strict';

import React, {PropTypes} from 'react';
import Component from 'react-pure-render/component';

import {DropdownButton} from 'react-bootstrap';
import {MenuItem} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {Input} from 'react-bootstrap';

const SUCCESS = 'success';
const WARNING = 'warning';
const ERROR = 'error';

const COMPLETE_LOCAL_NAME = '0';
const SHORTENED_LOCAL_NAME = '1';
const COMPLETE_16_UUIDS = '2';
const INCOMPLETE_16_UUIDS = '3';
const COMPLETE_128_UUIDS = '4';
const INCOMPLETE_128_UUIDS = '5';
const TX_POWER = '6';
const CUSTOM = '7';

const UUID_TYPE_16 = 0;
const UUID_TYPE_128 = 1;

export default class AdvertisingData extends Component {
    constructor(props) {
        super(props);
        this.value = '';
        this.type = null;
        this.typeApi = null;
        this.typeKey = null;
        this.title = 'Select data type';
        this.placeholderText = 'Select data type';
    }

    keyToAdvertisingType(key) {
        switch (key) {
            case COMPLETE_LOCAL_NAME:
                return 'Complete local name';
            case SHORTENED_LOCAL_NAME:
                return 'Shortened local name';
            case COMPLETE_16_UUIDS:
                return 'UUID 16 bit complete list';
            case INCOMPLETE_16_UUIDS:
                return 'UUID 16 bit more available';
            case COMPLETE_128_UUIDS:
                return 'UUID 128 bit complete list';
            case INCOMPLETE_128_UUIDS:
                return 'UUID 128 bit more available';
            case TX_POWER:
                return 'TX power level';
            case CUSTOM:
                return 'Custom AD type';
        }
    }

    keyToApiAdvType(key) {
        switch (key) {
            case COMPLETE_LOCAL_NAME:
                return 'completeLocalName';
            case SHORTENED_LOCAL_NAME:
                return 'shortenedLocalName';
            case COMPLETE_16_UUIDS:
                return 'completeListOf16BitServiceUuids';
            case INCOMPLETE_16_UUIDS:
                return 'incompleteListOf16BitServiceUuids';
            case COMPLETE_128_UUIDS:
                return 'completeListOf128BitServiceUuids';
            case INCOMPLETE_128_UUIDS:
                return 'incompleteListOf128BitServiceUuids';
            case TX_POWER:
                return 'txPowerLevel';
            case CUSTOM:
                return 'custom';
            default:
                return 'unknown';
        }
    }

    formatValue(value, key) {
        switch (key) {
            case COMPLETE_LOCAL_NAME:
            case SHORTENED_LOCAL_NAME:
                return value;

            case COMPLETE_16_UUIDS:
            case INCOMPLETE_16_UUIDS:
            case COMPLETE_128_UUIDS:
            case INCOMPLETE_128_UUIDS:
                // Create array of uuid text strings
                return value.replace(' ', '').split(',');

            case TX_POWER:
                return parseInt(value);

            default:
                return null;
        }
    }

    getPlaceholderText(key) {
        switch (key) {
            case COMPLETE_LOCAL_NAME:
            case SHORTENED_LOCAL_NAME:
                return 'Enter local name';

            case COMPLETE_16_UUIDS:
            case INCOMPLETE_16_UUIDS:
            case COMPLETE_128_UUIDS:
            case INCOMPLETE_128_UUIDS:
                // Create array of uuid text strings
                return 'Enter UUID(s)';

            case TX_POWER:
                return 'Enter TX power';

            default:
                return 'Enter value';
        }
    }

    handleSelect(event, eventKey) {
        this.value = '';
        this.typeKey = eventKey;
        this.title = this.keyToAdvertisingType(eventKey);
        this.placeholderText = this.getPlaceholderText(eventKey);
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
        const { onValueChange } = this.props;

        const typeValue = {
            typeKey: this.typeKey,
            type: this.type,
            typeApi: this.typeApi,
            value: this.value,
            formattedValue: this.formatValue(this.value, this.typeKey),
        };

        if (this.validateInput() != SUCCESS) {
            onValueChange(null);
            return;
        }

        onValueChange(typeValue);
    }

    validateInput() {
        switch (this.typeKey) {
            case COMPLETE_LOCAL_NAME:
            case SHORTENED_LOCAL_NAME:
                return this.validateLocalNameString(this.value);

            case COMPLETE_16_UUIDS:
            case INCOMPLETE_16_UUIDS:
                return this.validateUuid(this.value, UUID_TYPE_16);

            case COMPLETE_128_UUIDS:
            case INCOMPLETE_128_UUIDS:
                return this.validateUuid(this.value, UUID_TYPE_128);

            case TX_POWER:
                return this.validateTxPower(this.value);

            default:
                return ERROR;
        }
    }

    validateLocalNameString(value) {
        if (value.length == 0 || value.length > 23) {
            return ERROR;
        } else {
            return SUCCESS;
        }
    }

    validateUuid(value, uuidType) {
        const cleanedUuidArray = value.replace(/0[xX]/g, '').split(',');
        let regex;
        switch (uuidType) {
            case UUID_TYPE_16:
                regex = /^[0-9a-fA-F]{4}$/;
                break;
            case UUID_TYPE_128:
                regex = /^[0-9a-fA-F]{32}$/;
                break;
            default:
                return ERROR;
        }

        for (uuid of cleanedUuidArray) {
            if (uuid.trim().search(regex) < 0) {
                return ERROR;
            }
        }

        return SUCCESS;
    }

    validateTxPower(value) {
        if (value >= -127 && value <= 127 && value !== '') {
            return SUCCESS;
        } else {
            return ERROR;
        }
    }

    render() {
        const {
            onValueChange,
        } = this.props;

        const inputDisabled = (this.type === null);

        return (
            <div>
                <div className="adv-drop-container">
                    <div className="type-label">Type</div>
                    <DropdownButton className="adv-dropdown" title={this.title} 
                            id="dropdown-adv" label="Type"
                            onSelect={(event, eventKey) => this.handleSelect(event, eventKey)}>
                        <MenuItem eventKey="0">{this.keyToAdvertisingType('0')}</MenuItem>
                        <MenuItem eventKey="1">{this.keyToAdvertisingType('1')}</MenuItem>
                        <MenuItem eventKey="2">{this.keyToAdvertisingType('2')}</MenuItem>
                        <MenuItem eventKey="3">{this.keyToAdvertisingType('3')}</MenuItem>
                        <MenuItem eventKey="4">{this.keyToAdvertisingType('4')}</MenuItem>
                        <MenuItem eventKey="5">{this.keyToAdvertisingType('5')}</MenuItem>
                        <MenuItem eventKey="6">{this.keyToAdvertisingType('6')}</MenuItem>
                        {/*TODO: add support for custom AD: <MenuItem eventKey="7">{this.keyToAdvertisingType('7')}</MenuItem>*/}
                    </DropdownButton>
                </div>
                <div className="adv-value-container">
                    <Input
                        disabled={inputDisabled}
                        className="adv-value"
                        type="text"
                        id="value"
                        ref="advDataValue"
                        value={this.value}
                        label="Value"
                        hasFeedback
                        placeholder={this.placeholderText}
                        bsStyle={this.validateInput()}
                        onChange={event => this.handleChange(event)} />
                </div>
            </div>
        );
    }
}

AdvertisingData.propTypes = {
    onValueChange: PropTypes.func.isRequired,
};
