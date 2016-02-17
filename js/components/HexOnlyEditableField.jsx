/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React from 'react';

import Component from 'react-pure-render/component';

import EditableField from './EditableField.jsx';

export default class HexOnlyEditableField extends Component {
    constructor(props) {
        super(props);
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

        This component wraps EditableField, so see that component for info on how the dataflow etc works.

        There's a lot of complexity here related to keeping the caret in the right position.
    */
    _keyPressValidation(str) {
        const _hexRegEx = /^[0-9a-fA-F\-]*$/i;
        return _hexRegEx.test(str);
    }

    _formatInput(str, caretPosition) {
        caretPosition = this._calcCaretPosition(str, caretPosition);
        let chars = str.toUpperCase().replace(/-/g, '').split('');
        //insert dashes after every second char
        let inserted = 0;
        const originalLength = chars.length;

        for (let i = 2; i < originalLength; i += 2) {
            chars.splice(i + inserted, 0, '-');
            inserted += 1;
        }

        return {
            value: chars.join(''),
            caretPosition: caretPosition,
        };
    }

    _onBeforeBackspace(e) {
        //when backspace will remove a dash, also remove the character before the dash
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;
        if (selectionStart !== selectionEnd) {
            return;
        }

        const caret = selectionStart;
        let str = e.target.value;
        if (str.substr(caret - 1, 1) === '-') {
            //remove the dash - this sets the caret at end of the text
            e.target.value = str.slice(0, caret - 1) + str.slice(caret);
            //reset the caret back to before the dash, so the backspace event itself will remove the char before the dash
            e.target.setSelectionRange(caret - 1, caret - 1);
        }
    }

    _onBeforeDelete(e) {
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;
        if (selectionStart !== selectionEnd) {
            return;
        }

        const caret = selectionStart;
        let str = e.target.value;

        if (str.substr(caret, 1) === '-') {
            //remove the dash - this sets the caret at end of the text
            e.target.value = str.slice(0, caret) + str.slice(caret + 1);
            //reset the caret back to after the dash, so the delete event itself will remove the char after the dash
            e.target.setSelectionRange(caret, caret);
        }
    }

    _calcCaretPosition(origValue, caretPosition) {
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
        const dashesBeforeCaret = origValue.substr(0, caretPosition).match(/-/g);
        const numDashesBeforeCaret = dashesBeforeCaret === null ? 0 : dashesBeforeCaret.length;
        const caretPositionWithoutDashes = caretPosition - numDashesBeforeCaret;
        const correctNumberOfDashes = Math.floor(caretPositionWithoutDashes / 2);
        caretPosition = caretPositionWithoutDashes + correctNumberOfDashes;
        return caretPosition;
    }

    _completeValidation(str) {
        const valueArray = str.split('-');
        for (let value of valueArray) {
            if (value.length % 2 !== 0) {
                return {valid: false, validationMessage: 'Please enter full bytes (pairs of hexadecimals)'};
            }
        }

        return {valid: true, validationMessage: 'Valid value'};
    }

    _getValueArray(value) {
        if (!this._completeValidation(value)) {
            return;
        }

        let valueArray = [];

        for (let i = 0; i < value.length; i += 3) {
            let slice = value.substring(i, i + 2);
            let parsedInt = parseInt(slice, 16);
            valueArray.push(parsedInt);
        }

        return valueArray;
    }

    render() {
        const {value, keyPressValidation, completeValidation, formatInput, onBeforeBackspace, onBeforeDelete, ...props} = this.props; //pass along all props except these

        let parsedValue = value;

        if (value.constructor === Array) {
        // Convert from array [1, 10, 16, 20] to hex string "01-0A-10-14"
            const hexValueStringArray = value.map(decimalNumber => ('0' + decimalNumber.toString(16)).slice(-2));
            parsedValue = hexValueStringArray.join('-').toUpperCase();
        }

        //formatInput={(str, caretPosition) => this._formatInput(str, caretPosition)}
        return <EditableField {...props}
                              value={parsedValue}
                              keyPressValidation={this._keyPressValidation}
                              completeValidation={str => this._completeValidation(str)}
                              formatInput={(str, caretPosition) => this._formatInput(str, caretPosition)}
                              onBeforeBackspace={this._onBeforeBackspace}
                              onBeforeDelete={this._onBeforeDelete}
                              getValueArray={value => this._getValueArray(value)}
                              ref='editableField' />;
    }
}
