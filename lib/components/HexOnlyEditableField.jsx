/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */
/* eslint react/no-redundant-should-component-update: off */

'use strict';

import React from 'react';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

import {
    hexArrayToHexText,
    hexArrayToText,
    textToHexText,
} from '../utils/stringUtil';
import EditableField from './EditableField';

function calcCaretPosition(origValue, caretPosition) {
    /*
     * Replacing the textarea contents places the caret at the end.
     * We need to place the caret back where it should be.
     * Since we're adding dashes, this is not so trivial.
     *
     * Consider if the user typed the 1 in the string below:
     * Before formatting: AA-A1A-AA, After: AA-A1-AA-A
     * caretPosition before: 5, caretPosition after: 5
     *
     * But here it works differently:
     * Before formatting: AA-AA1-AA, After: AA-AA-1A-A
     * caretPosition before: 6, caretPosition after: 7
     *
     * And there's also this case:
     * Before formatting: AA-AA-1AA, After: AA-AA-1A-A
     * caretPosition before: 7, caretPosition after: 7
     *
     * Also have to handle backspace:
     * Before formatting: AA-A-AA, After: AA-AA-A
     * caretPosition before: 4, caretPosition after: 4
     *
     * Find where the caret would be without the dashes,
     * and map that position back to the dashed string
     */
    const dashesBeforeCaret = origValue.substr(0, caretPosition).match(/ /g);
    const numDashesBeforeCaret =
        dashesBeforeCaret === null ? 0 : dashesBeforeCaret.length;
    const caretPositionWithoutDashes = caretPosition - numDashesBeforeCaret;
    const correctNumberOfDashes = Math.floor(caretPositionWithoutDashes / 2);
    return caretPositionWithoutDashes + correctNumberOfDashes;
}

class HexOnlyEditableField extends React.Component {
    constructor(props) {
        super(props);
        this.keyPressValidation = this.keyPressValidation.bind(this);
        this.formatInput = this.formatInput.bind(this);
        this.completeValidation = this.completeValidation.bind(this);
        this.onBeforeBackspace = this.onBeforeBackspace.bind(this);
        this.onBeforeDelete = this.onBeforeDelete.bind(this);
        this.getValueArray = this.getValueArray.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        const { value, onRead, onWrite } = this.props;
        if (!_.isEqual(value, nextProps.value)) {
            return true;
        }

        if (onRead !== nextProps.onRead) {
            return true;
        }

        if (onWrite !== nextProps.onWrite) {
            return true;
        }

        return false;
    }

    onBeforeBackspace(e) {
        this.removeSelection(e, -1);
    }

    onBeforeDelete(e) {
        this.removeSelection(e, 0);
    }

    onChange(value) {
        const { onChange, showText } = this.props;
        if (onChange) {
            const v = showText ? this.getValueArray(value) : value;
            onChange(v);
        }
    }

    getValueArray(val) {
        const { showText } = this.props;
        let value = val;
        if (showText) {
            value = textToHexText(value);
        }

        if (!this.completeValidation(value)) {
            return undefined;
        }

        const valueArray = [];

        for (let i = 0; i < value.length; i += 3) {
            const slice = value.substring(i, i + 2);
            const parsedInt = parseInt(slice, 16);
            valueArray.push(parsedInt);
        }

        return valueArray;
    }

    /*
        Produces some text that changes into a textarea when clicked (like EditableField).
        The textarea only accepts hexadecimal characters.
        The input is automatically formatted into pairs of characters (bytes), like so: AB-D2-C1.

        Usage:
        <HexOnlyEditableField value={value} />

        Where _value_ is the text that should turn editable.
        It also accepts all props that EditableField accepts, except
        keyPressValidation, completeValidation, onBackspace and formatInput

        This component wraps EditableField, so see that component for info
        on how the dataflow etc works.

        There's a lot of complexity here related to keeping the caret in the right position.
    */
    keyPressValidation(str) {
        const { showText } = this.props;
        if (showText) {
            return true;
        }

        const hexRegEx = /^[0-9a-fA-F ]*$/i;
        return hexRegEx.test(str);
    }

    formatInput(str, caretPosition) {
        const { showText } = this.props;
        if (showText) {
            return {
                value: str,
                caretPosition,
            };
        }

        const caretPos = calcCaretPosition(str, caretPosition);
        const chars = str.toUpperCase().replace(/ /g, '').split('');
        // insert spaces after every second char
        let inserted = 0;
        const originalLength = chars.length;

        for (let i = 2; i < originalLength; i += 2) {
            chars.splice(i + inserted, 0, ' ');
            inserted += 1;
        }

        return {
            value: chars.join(''),
            caretPosition: caretPos,
        };
    }

    removeSelection(e, caretModifier) {
        const { showText } = this.props;
        if (showText) {
            return;
        }

        const { selectionStart, selectionEnd } = e.target;

        if (selectionStart !== selectionEnd) {
            return;
        }

        const caret = selectionStart + caretModifier;
        const str = e.target.value;

        if (str.substr(caret, 1) === ' ') {
            // remove the dash - this sets the caret at end of the text
            e.target.value = str.slice(0, caret) + str.slice(caret + 1);
            // reset the caret back to before the dash, so the backspace
            // event itself will remove the char before the dash
            e.target.setSelectionRange(caret, caret);
        }
    }

    completeValidation(str) {
        const { showText } = this.props;
        const s = showText ? textToHexText(str) : str;

        const valueArray = s.trim().split(' ');
        for (let i = 0; i < valueArray.length; i += 1) {
            const value = valueArray[i];
            if (value.length % 2 !== 0) {
                return {
                    valid: false,
                    validationMessage:
                        'Please enter full bytes (pairs of hexadecimals)',
                };
            }
        }

        return { valid: true, validationMessage: 'Valid value' };
    }

    render() {
        const { showText, value, title, ...props } = this.props; // pass along all props except these

        const parsedValue = hexArrayToHexText(value);
        let titleValue = parsedValue;
        let showValue = '';

        if (title) {
            titleValue = `${title}, ${titleValue}`;
        }

        if (!showText) {
            showValue = parsedValue;
        } else {
            showValue = hexArrayToText(value);
        }

        return (
            <EditableField
                {...props}
                value={showValue}
                title={titleValue}
                keyPressValidation={this.keyPressValidation}
                completeValidation={this.completeValidation}
                formatInput={this.formatInput}
                onBeforeBackspace={this.onBeforeBackspace}
                onBeforeDelete={this.onBeforeDelete}
                getValueArray={this.getValueArray}
                onChange={this.onChange}
            />
        );
    }
}

HexOnlyEditableField.propTypes = {
    showText: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    keyPressValidation: PropTypes.func,
    completeValidation: PropTypes.func,
    formatInput: PropTypes.func,
    onBeforeBackspace: PropTypes.func,
    onBeforeDelete: PropTypes.func,
    onChange: PropTypes.func,
    title: PropTypes.string,
    onRead: PropTypes.func,
    onWrite: PropTypes.func,
};

HexOnlyEditableField.defaultProps = {
    showText: false,
    title: null,
    onChange: null,
    onRead: null,
    onWrite: null,
    keyPressValidation: null,
    completeValidation: null,
    formatInput: null,
    onBeforeBackspace: null,
    onBeforeDelete: null,
};

export default HexOnlyEditableField;
