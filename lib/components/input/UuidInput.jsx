/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { validateUuid } from '../../utils/validateUuid';
import UuidLookup from '../UuidLookup';
import TextInput from './TextInput';

class UuidInput extends React.PureComponent {
    constructor(props) {
        super(props);
        const { value } = this.props;
        this.uuid = value;
        this.handleSelection = this.handleSelection.bind(this);
        this.onUuidChange = this.onUuidChange.bind(this);
    }

    onUuidChange(e) {
        const { handleSelection } = this.props;
        const hexRegEx = /^[0-9A-F]*$/i;
        const textarea = e.target;
        this.uuid = textarea.value;
        const valid = hexRegEx.test(this.uuid);
        let caretPosition = textarea.selectionStart;

        if (!valid) {
            caretPosition -= 1;
            this.forceUpdate(() =>
                textarea.setSelectionRange(caretPosition, caretPosition)
            );
            return;
        }

        handleSelection(this.uuid);
    }

    validateUuidInput() {
        return validateUuid(this.uuid);
    }

    handleSelection(event, uuid) {
        const { handleSelection } = this.props;
        this.uuid = uuid;
        handleSelection(uuid);
    }

    render() {
        const { label, uuidDefinitions, value } = this.props;

        const uuidSelectButton = (
            <UuidLookup
                onSelect={this.handleSelection}
                title={`Predefined ${label}s`}
                uuidDefs={uuidDefinitions()}
            />
        );

        return (
            <TextInput
                label={label}
                hasFeedback
                validationState={this.validateUuidInput()}
                value={value}
                onChange={this.onUuidChange}
                buttonAfter={uuidSelectButton}
            />
        );
    }
}

UuidInput.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    uuidDefinitions: PropTypes.func.isRequired,
    handleSelection: PropTypes.func.isRequired,
};

export default UuidInput;
