/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import PropTypes from 'prop-types';

import {
    uuid16bitServiceDefinitions,
    uuid128bitServiceDefinitions,
} from '../utils/uuid_definitions';
import TextInput from './input/TextInput';
import UuidLookup from './UuidLookup';

const SUCCESS = 'success';
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

function keyToAdvertisingType(key) {
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
        default:
            return 'unknown';
    }
}

function keyToApiAdvType(key) {
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

function formatValue(value, key) {
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
            return parseInt(value, 10);

        case CUSTOM:
            return value;

        default:
            return null;
    }
}

function getPlaceholderText(key) {
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

        case CUSTOM:
            return 'Enter AD data value (hex)';

        default:
            return 'Enter value';
    }
}

function validateLocalNameString(value) {
    if (value.length === 0 || value.length > 29) {
        return ERROR;
    }
    return SUCCESS;
}

function validateUuid(value, uuidType) {
    const cleanedUuidArray = value
        .replace(/0[xX]/g, '')
        .replace('-', '')
        .split(',');
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

    for (let i = 0; i < cleanedUuidArray.length; i += 1) {
        if (cleanedUuidArray[i].trim().search(regex) < 0) {
            return ERROR;
        }
    }

    return SUCCESS;
}

function validateTxPower(value) {
    if (value >= -127 && value <= 127 && value !== '') {
        return SUCCESS;
    }
    return ERROR;
}

function validateCustom(value) {
    const regex = /^((0[xX])?[A-Fa-f0-9]{2})+$/g;
    if (value.trim().search(regex) >= 0) {
        return SUCCESS;
    }
    return ERROR;
}

class AdvertisingData extends React.PureComponent {
    constructor(props) {
        super(props);
        this.value = '';
        this.adTypeValue = '';
        this.type = null;
        this.typeApi = null;
        this.typeKey = null;
        this.title = 'Select data type';
        this.placeholderText = 'Select data type';

        this.handleSelect = this.handleSelect.bind(this);
        this.handleUuidSelect = this.handleUuidSelect.bind(this);
        this.handleAdTypeChange = this.handleAdTypeChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleUuidSelect(event, eventKey) {
        if (this.value !== '') {
            this.value += ', ';
        }

        this.value += eventKey;
        this.forceUpdate();
        this.emitValueChange();
    }

    handleSelect(eventKey) {
        this.value = '';
        this.typeKey = eventKey;
        this.title = keyToAdvertisingType(eventKey);
        this.placeholderText = getPlaceholderText(eventKey);
        this.forceUpdate();

        this.type = keyToAdvertisingType(this.typeKey);
        this.typeApi = keyToApiAdvType(this.typeKey);
        this.emitValueChange();
    }

    handleChange(event) {
        this.value = event.target.value;
        this.forceUpdate();
        this.emitValueChange();
    }

    handleAdTypeChange(event) {
        this.adTypeValue = event.target.value;
        this.forceUpdate();
        this.emitValueChange();
    }

    emitValueChange() {
        const { onValueChange } = this.props;

        if (this.validateInput() !== SUCCESS) {
            onValueChange(null);
            return;
        }

        if (this.typeKey === CUSTOM && this.validateAdType() !== SUCCESS) {
            onValueChange(null);
            return;
        }

        const tempValue =
            this.typeKey === CUSTOM
                ? (this.adTypeValue + this.value).replace(/0[xX]/g, '')
                : this.value;

        const typeValue = {
            typeKey: this.typeKey,
            type: this.type,
            typeApi: this.typeApi,
            value: tempValue,
            formattedValue: formatValue(tempValue, this.typeKey),
        };

        onValueChange(typeValue);
    }

    validateInput() {
        switch (this.typeKey) {
            case COMPLETE_LOCAL_NAME:
            case SHORTENED_LOCAL_NAME:
                return validateLocalNameString(this.value);

            case COMPLETE_16_UUIDS:
            case INCOMPLETE_16_UUIDS:
                return validateUuid(this.value, UUID_TYPE_16);

            case COMPLETE_128_UUIDS:
            case INCOMPLETE_128_UUIDS:
                return validateUuid(this.value, UUID_TYPE_128);

            case TX_POWER:
                return validateTxPower(this.value);

            case CUSTOM:
                return validateCustom(this.value);

            default:
                return ERROR;
        }
    }

    validateAdType() {
        const regex = /^(0[xX])?[A-Fa-f0-9]{2}$/g;
        if (this.adTypeValue.trim().search(regex) >= 0) {
            return SUCCESS;
        }

        return ERROR;
    }

    render() {
        const inputDisabled = this.type === null;
        let uuidDef = {};
        if (this.title.includes('16 bit')) {
            uuidDef = uuid16bitServiceDefinitions();
        } else if (this.title.includes('128 bit')) {
            uuidDef = uuid128bitServiceDefinitions();
        }
        const uuidLookupDisabled = Object.keys(uuidDef).length === 0;

        const adTypeDiv =
            this.typeKey === CUSTOM ? (
                <div>
                    <TextInput
                        label="AD type value"
                        placeholder="Enter AD type value (1 byte hex)"
                        hasFeedback
                        value={this.adTypeValue}
                        labelClassName=""
                        wrapperClassName="col-md-12"
                        validationState={this.validateAdType()}
                        onChange={this.handleAdTypeChange}
                    />
                </div>
            ) : null;

        const uuidLookupDiv = !uuidLookupDisabled ? (
            <UuidLookup
                onSelect={this.handleUuidSelect}
                title="Predefined service UUIDs"
                uuidDefs={uuidDef}
            />
        ) : null;

        return (
            <div>
                <div className="adv-drop-container">
                    <div className="type-label">AD type</div>
                    <DropdownButton
                        className="adv-dropdown"
                        title={this.title}
                        id="dropdown-adv"
                        label="Type"
                        onSelect={this.handleSelect}
                        variant="secondary"
                    >
                        <Dropdown.Item eventKey="0">
                            {keyToAdvertisingType('0')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="1">
                            {keyToAdvertisingType('1')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="2">
                            {keyToAdvertisingType('2')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="3">
                            {keyToAdvertisingType('3')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="4">
                            {keyToAdvertisingType('4')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="5">
                            {keyToAdvertisingType('5')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="6">
                            {keyToAdvertisingType('6')}
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="7">
                            {keyToAdvertisingType('7')}
                        </Dropdown.Item>
                    </DropdownButton>
                </div>
                <div className="adv-value-container">
                    {adTypeDiv}
                    <TextInput
                        buttonAfter={uuidLookupDiv}
                        disabled={inputDisabled}
                        id="value"
                        value={this.value}
                        label="Value"
                        hasFeedback
                        placeholder={this.placeholderText}
                        validationState={this.validateInput()}
                        labelClassName="type-label col-md-3"
                        wrapperClassName="col-md-12"
                        onChange={this.handleChange}
                    />
                </div>
            </div>
        );
    }
}

AdvertisingData.propTypes = {
    onValueChange: PropTypes.func.isRequired,
};

export default AdvertisingData;
