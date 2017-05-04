/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React, { PropTypes } from 'react';

import * as _ from 'lodash';

import EditableField from './EditableField';

import { hexArrayToText, textToHexText, hexArrayToHexText } from '../utils/stringUtil';

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
    const numDashesBeforeCaret = dashesBeforeCaret === null ? 0 : dashesBeforeCaret.length;
    const caretPositionWithoutDashes = caretPosition - numDashesBeforeCaret;
    const correctNumberOfDashes = Math.floor(caretPositionWithoutDashes / 2);
    return caretPositionWithoutDashes + correctNumberOfDashes;
}

class HexOnlyEditableField extends React.PureComponent {
    constructor(props) {
        super(props);
        this.LkeyPressValidation = this.LkeyPressValidation.bind(this);
        this.LformatInput = this.LformatInput.bind(this);
        this.LcompleteValidation = this.LcompleteValidation.bind(this);
        this.LonBeforeBackspace = this.LonBeforeBackspace.bind(this);
        this.LonBeforeDelete = this.LonBeforeDelete.bind(this);
        this.LgetValueArray = this.LgetValueArray.bind(this);
        this.LonChange = this.LonChange.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        if (!_.isEqual(this.props.value, nextProps.value)) {
            return true;
        }

        if (this.props.onRead !== nextProps.onRead) {
            return true;
        }

        if (this.props.onWrite !== nextProps.onWrite) {
            return true;
        }

        return false;
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
    LkeyPressValidation(str) {
        if (this.props.showText) {
            return true;
        }

        const hexRegEx = /^[0-9a-fA-F ]*$/i;
        return hexRegEx.test(str);
    }

    LformatInput(str, caretPosition) {
        if (this.props.showText) {
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

    LremoveSelection(e, caretModifier) {
        if (this.props.showText) {
            return;
        }

        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;

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

    LonBeforeBackspace(e) {
        this.LremoveSelection(e, -1);
    }

    LonBeforeDelete(e) {
        this.LremoveSelection(e, 0);
    }

    LcompleteValidation(str) {
        const s = this.props.showText ? textToHexText(str) : str;

        const valueArray = s.trim().split(' ');
        for (let i = 0; i < valueArray.length; i += 1) {
            const value = valueArray[i];
            if (value.length % 2 !== 0) {
                return { valid: false, validationMessage: 'Please enter full bytes (pairs of hexadecimals)' };
            }
        }

        return { valid: true, validationMessage: 'Valid value' };
    }

    LgetValueArray(val) {
        let value = val;
        if (this.props.showText) {
            value = textToHexText(value);
        }

        if (!this.LcompleteValidation(value)) {
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

    LonChange(value) {
        if (this.props.onChange) {
            const v = this.props.showText ? this.LgetValueArray(value) : value;
            this.props.onChange(v);
        }
    }

    render() {
        const {
            showText,
            value,
            keyPressValidation,
            completeValidation,
            formatInput,
            onBeforeBackspace,
            onBeforeDelete,
            onChange,
            title,
            ...props
        } = this.props; // pass along all props except these

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
                keyPressValidation={this.LkeyPressValidation}
                completeValidation={this.LcompleteValidation}
                formatInput={this.LformatInput}
                onBeforeBackspace={this.LonBeforeBackspace}
                onBeforeDelete={this.LonBeforeDelete}
                getValueArray={this.LgetValueArray}
                onChange={this.LonChange}
            />
        );
    }
}

HexOnlyEditableField.propTypes = {
    showText: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string,
    ]).isRequired,
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
