/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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
import { PropTypes } from 'react';

import Component from 'react-pure-render/component';

import listensToClickOutside from 'react-onclickoutside/decorator';
import TextareaAutosize from 'react-textarea-autosize';

import $ from 'jquery';

@listensToClickOutside()
export default class EditableField extends Component {
    constructor(props) {
        super(props);

        this.editing = false;
        this.value = this.props.value;
        this.validationMessage = '';
    }
    /*
    Produces some text that changes into a textarea when clicked, OR if plain={true}, it simply produces a textarea.
    Exposes various events for validation and formatting.

    Usage:
    <EditableField value={value}
        keyPressValidation={keyPressValidation} completeValidation={completeValidation}
                    onBeforeBackspace={onBeforeBackspace} formatInput={formatInput} insideSelector='.some-selector' />
     />

    If props

    Props:
    value (required): The value to make editable.
    keyPressValidation (optional):
        a function called for every keypress. If it return false, the keypress is rejected.
    completeValidation (optional):
        a function called when the user presses the ok button. If it returns false the component will stay in edit mode.
    onBeforeBackspace (optional):
        function called when backspace is detected _onKeyDown. It is passed the event object.
    formatInput (optional):
        function to format the textarea content, called onChange, after keyPressValidation.
        It must return an object with properties value and caretPosition.
    insideSelector (optional):
        string with a css selector. The selector must match a parent of the textarea.
        Clicks on the document that do not hit this parent will close the editor.
        If no selector is given, the textarea itself will be used for the same purpose.
    plain (optional):
        If true, the component simply shows a textarea at all times.
        It does not change between edit and non-edit modes
    onChange (optional):
        function, fires if the value changed due to user input. First argument is the new value.

    */
    handleClickOutside(e) {
        if (this.editing) {
            if (this.props.insideSelector) {
                //dont close if click was within a parent element that matches insideSelector
                const textarea = React.findDOMNode(this.refs.editableTextarea);
                if (textarea) {
                    const insideParent = $(textarea).parents(this.props.insideSelector)[0];
                    if (e.path.includes(insideParent)) {
                        return;
                    }
                }
            }

            this.editing = false,
            this.value = this.props.value, //reset textarea value
            this.validationMessage = '';
            this.forceUpdate();
        }
    }

    _toggleEditing(e) {
        e.stopPropagation();
        this.editing = !this.editing;
        this.forceUpdate();
    }

    _onChange(e) {
        const textarea = e.target;
        let value = textarea.value;
        let caretPosition = textarea.selectionStart;
        const valid = this.props.keyPressValidation ? this.props.keyPressValidation(value) : true;

        if (valid) {
            if (this.props.formatInput) {
                const formatInputResult = this.props.formatInput(value, caretPosition);
                value = formatInputResult.value;
                caretPosition = formatInputResult.caretPosition;
            }

            this.value = value;
            this.validationMessage = '';

        } else {
            caretPosition--;
        }

        this.forceUpdate(() => textarea.setSelectionRange(caretPosition, caretPosition));
    }

    _onKeyDown(e) {
        if (e.key === 'Backspace' && this.props.onBeforeBackspace) {
            this.props.onBeforeBackspace(e);
        }

        if (e.key === 'Delete' && this.props.onBeforeDelete) {
            this.props.onBeforeDelete(e);
        }

        if (e.key === 'Enter') {
            this._write();
            e.preventDefault();
        }
    }

    _onWriteButtonClick(e) {
        e.stopPropagation();
        this._write();
    }

    _onReadButtonClick(e) {
        const { onRead } = this.props;

        e.stopPropagation();
        this._read();
    }

    _write() {
        const {valid, validationMessage} = this.props.completeValidation ? this.props.completeValidation(this.value) : {valid: true};
        if (valid) {
            this.editing = false;
            if (this.props.onWrite) {
                this.props.onWrite(this.props.getValueArray(this.value));
            }
        } else {
            this.validationMessage = validationMessage;
        }
    }

    _read() {
        this.props.onRead();
    }

    _stopPropagation(e) {
        e.stopPropagation();
    }

    render() {
        const nonBreakingSpace = '\u00A0';
        //Delaying the creation of TextareaAutosize etc until they're needed gives a performance win.
        //This matters when we get rapidly rerendered, e.g. during an animation.
        let child;
        if (this.props.plain) {
            child = <TextareaAutosize {...this.props}
                                      ref='editableTextarea'
                                      minRows={1}
                                      onKeyDown={e => this._onKeyDown(e)}
                                      value={this.value}
                                      onChange={e => this._onChange(e)}
                                      onClick={this._stopPropagation} />
        } else if (this.editing) {
            child = <div className='editable-field-editor-wrap'>
                        <div className='alert-wrap'>
                            <div className='alert alert-danger tooltip top' style={{display: this.validationMessage == '' ? 'none' : 'block' }}>
                                <div className='tooltip-arrow'></div>
                                {this.validationMessage}
                            </div>
                        </div>
                        <div className='btn btn-primary btn-xs btn-nordic' onClick={e => this._onWriteButtonClick(e)}><i className='icon-ok'></i></div>
                        <TextareaAutosize {...this.props}
                                          ref='editableTextarea'
                                          minRows={1}
                                          onKeyDown={e => this._onKeyDown(e)}
                                          value={this.value}
                                          onChange={e => this._onChange(e)}
                                          onClick={this._stopPropagation} />
                    </div>;
        } else if (this.props.showReadButton) {
            child = <div className='editable-field-editor-wrap'>
                        <div className='btn btn-primary btn-xs btn-nordic' onClick={e => this._onReadButtonClick(e)}><i className='icon-ccw'></i></div>
                        <div className='subtle-text editable' onClick={e => this._toggleEditing(e)}>
                            <span>{this.value || nonBreakingSpace}</span>
                        </div>
                    </div>;
        } else {
            child = <div className='subtle-text editable' onClick={e => this._toggleEditing(e)}>
                        <span>{this.value || nonBreakingSpace}</span>
                    </div>;
        }

        return (
            <div className='editable-field'>
                {child}
            </div>
        );
    }
}

EditableField.propTypes = {
    value: PropTypes.string.isRequired,
    onWrite: PropTypes.func.isRequired,
    onRead: PropTypes.func.isRequired,
    showReadButton: PropTypes.bool.isRequired,
    insideSelector: PropTypes.string,
};
