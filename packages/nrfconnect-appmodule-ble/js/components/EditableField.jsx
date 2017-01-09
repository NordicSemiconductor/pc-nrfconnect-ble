/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import onClickOutside  from 'react-onclickoutside';
import TextareaAutosize from 'react-textarea-autosize';

import { TextArea } from 'nrfconnect-core';

import $ from 'jquery';

export default onClickOutside(React.createClass({

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
                const textarea = ReactDOM.findDOMNode(this.refs.editableTextarea);
                if (textarea) {
                    const insideParent = $(textarea).parents(this.props.insideSelector)[0];
                    if (e.path.includes(insideParent)) {
                        return;
                    }
                }
            }

            this.editing = false;
            this.value = this.props.value; //reset textarea value
            this.validationMessage = '';
            this.forceUpdate();
        }
    },

    _selectParentAndToggleEditing(e) {
        e.stopPropagation();
        this._toggleEditing(e);
        this.props.selectParent(e);
    },

    _selectParent(e) {
        e.stopPropagation();
        this.props.selectParent(e);
    },

    _toggleEditing(e) {
        e.stopPropagation();

        if (this.props.onWrite) {
            this.editing = !this.editing;
            this.forceUpdate();
        }
    },

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

        if (this.props.onChange) {
            this.props.onChange(this.value);
        }
    },

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
    },

    _onWriteButtonClick(e) {
        e.stopPropagation();
        this._write();
    },

    _onReadButtonClick(e) {
        const { onRead } = this.props;

        e.stopPropagation();
        this._read();
    },

    _write() {
        const { valid, validationMessage } = this.props.completeValidation ? this.props.completeValidation(this.value) : { valid: true };
        if (valid) {
            this.editing = false;
            if (this.props.onWrite) {
                this.props.onWrite(this.props.getValueArray(this.value));
            }
        } else {
            this.validationMessage = validationMessage;
        }
    },

    _read() {
        this.props.onRead();
    },

    _stopPropagation(e) {
        e.stopPropagation();
    },

    componentDidMount() {
        this.editing = false;
        this.value = this.props.value;
        this.validationMessage = '';
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.editing) {
            const textarea = ReactDOM.findDOMNode(this.refs.editableTextarea);
            const caretPosition = textarea.value.length;
            textarea.focus();
            textarea.setSelectionRange(caretPosition, caretPosition);
        }
    },

    render() {
        const nonBreakingSpace = '\u00A0';
        //Delaying the creation of TextareaAutosize etc until they're needed gives a performance win.
        //This matters when we get rapidly rerendered, e.g. during an animation.
        let child;

        if (!this.editing) {
            this.value = this.props.value;
        }

        const readButton = this.props.showReadButton ?
            <div className='btn btn-primary btn-xs btn-nordic' title='Read' onClick={e => this._onReadButtonClick(e)}><i className='icon-ccw'></i></div> : null;

        if (this.props.plain) {
            child = <TextArea ref='editableTextarea'
                                      label={this.props.label}
                                      title={this.props.title}
                                      onKeyDown={e => this._onKeyDown(e)}
                                      value={this.props.value}
                                      onChange={e => this._onChange(e)}
                                      onClick={this._stopPropagation} />;
        } else if (this.editing && this.props.onWrite) {
            child = <div className='editable-field-editor-wrap native-key-bindings'>
                        <div className='alert-wrap'>
                            <div className='alert alert-danger tooltip top' style={{ display: this.validationMessage === '' ? 'none' : 'block' }}>
                                <div className='tooltip-arrow'></div>
                                {this.validationMessage}
                            </div>
                        </div>
                        <div className='btn btn-primary btn-xs btn-nordic' title='Write' onClick={e => this._onWriteButtonClick(e)}><i className='icon-ok'></i></div>
                        <TextareaAutosize ref='editableTextarea'
                                          minRows={1}
                                          onKeyDown={e => this._onKeyDown(e)}
                                          title={this.props.title}
                                          value={this.value}
                                          onChange={e => this._onChange(e)}
                                          onClick={this._stopPropagation} />
                    </div>;
        } else if (this.props.showReadButton && this.props.onRead && this.props.onWrite) {
            child = <div className='editable-field-editor-wrap'>
                        <div className='btn btn-primary btn-xs btn-nordic' title='Read' onClick={e => this._onReadButtonClick(e)}><i className='icon-ccw'></i></div>
                        <div className='subtle-text editable' onClick={e => this._toggleEditing(e)}>
                            <span>{this.value || nonBreakingSpace}</span>
                        </div>
                    </div>;
        } else if (this.props.onRead && !this.props.onWrite) {
            child = <div>
                        {readButton}
                        <div className='subtle-text'>
                            <span>{this.value || nonBreakingSpace}</span>
                        </div>
                    </div>;
        } else if (!this.props.onRead && !this.props.onWrite) {
            child = <div className='subtle-text' title={this.props.title} onClick={e => this._selectParent(e)}>
                        <span>{this.value || nonBreakingSpace}</span>
                    </div>;
        } else {
            child = <div className='subtle-text editable' title={this.props.title} onClick={e => this._selectParentAndToggleEditing(e)}>
                        <span>{this.value || nonBreakingSpace}</span>
                    </div>;
        }

        return (
            <div className='editable-field'>
                {child}
            </div>
        );
    },

    propTypes: {
        value: PropTypes.string.isRequired,
        onWrite: PropTypes.func,
        onRead: PropTypes.func,
        showReadButton: PropTypes.bool,
        insideSelector: PropTypes.string,
    }
}));
