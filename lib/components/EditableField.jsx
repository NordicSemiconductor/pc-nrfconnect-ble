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

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import TextareaAutosize from 'react-textarea-autosize';
import $ from 'jquery';

import TextArea from './input/TextArea';

function stopPropagation(e) {
    e.stopPropagation();
}

class EditableField extends React.Component {
    /*
    Produces some text that changes into a textarea when clicked, OR if plain={true},
    it simply produces a textarea. Exposes various events for validation and formatting.

    Usage:
    <EditableField value={value}
        keyPressValidation={keyPressValidation} completeValidation={completeValidation}
        onBeforeBackspace={onBeforeBackspace} formatInput={formatInput}
        insideSelector='.some-selector'
    />

    If props

    Props:
    value (required): The value to make editable.
    keyPressValidation (optional):
        a function called for every keypress. If it return false, the keypress is rejected.
    completeValidation (optional):
        a function called when the user presses the ok button.
        If it returns false the component will stay in edit mode.
    onBeforeBackspace (optional):
        function called when backspace is detected onKeyDown. It is passed the event object.
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

    constructor(props) {
        super(props);
        this.selectParentAndToggleEditing = this.selectParentAndToggleEditing.bind(this);
        this.selectParent = this.selectParent.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onWriteButtonClick = this.onWriteButtonClick.bind(this);
        this.onReadButtonClick = this.onReadButtonClick.bind(this);
    }

    componentDidMount() {
        this.editing = false;
        this.value = this.props.value;
        this.validationMessage = '';
    }

    componentDidUpdate() {
        if (this.editing) {
            const textarea = this.editableTextarea;
            const caretPosition = textarea.value.length;
            textarea.focus();
            textarea.selectionStart = caretPosition;
            textarea.selectionEnd = caretPosition;
        }
    }

    onChange(e) {
        const textarea = e.target;
        let { value } = textarea;
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
            caretPosition -= 1;
        }

        this.forceUpdate(() => textarea.setSelectionRange(caretPosition, caretPosition));

        if (this.props.onChange) {
            this.props.onChange(this.value);
        }
    }

    onKeyDown(e) {
        if (e.key === 'Backspace' && this.props.onBeforeBackspace) {
            this.props.onBeforeBackspace(e);
        }

        if (e.key === 'Delete' && this.props.onBeforeDelete) {
            this.props.onBeforeDelete(e);
        }

        if (e.key === 'Enter') {
            this.write();
            e.preventDefault();
        }
    }

    onWriteButtonClick(e) {
        e.stopPropagation();
        this.write();
    }

    onReadButtonClick(e) {
        e.stopPropagation();
        this.read();
    }

    handleClickOutside(e) {
        if (this.editing) {
            if (this.props.insideSelector) {
                // don't close if click was within a parent element that matches insideSelector
                const textarea = this.editableTextarea;
                if (textarea) {
                    const insideParent = $(textarea).parents(this.props.insideSelector)[0];
                    if (e.path.includes(insideParent)) {
                        return;
                    }
                }
            }

            this.editing = false;
            this.value = this.props.value; // reset textarea value
            this.validationMessage = '';
            this.forceUpdate();
        }
    }

    selectParentAndToggleEditing(e) {
        e.stopPropagation();
        this.toggleEditing(e);
        this.props.selectParent(e);
    }

    selectParent(e) {
        e.stopPropagation();
        this.props.selectParent(e);
    }

    toggleEditing(e) {
        e.stopPropagation();

        if (this.props.onWrite) {
            this.editing = !this.editing;
            this.forceUpdate();
        }
    }

    write() {
        const { valid, validationMessage } = this.props.completeValidation
            ? this.props.completeValidation(this.value)
            : { valid: true };
        if (valid) {
            this.editing = false;
            if (this.props.onWrite) {
                this.props.onWrite(this.props.getValueArray(this.value));
            }
        } else {
            this.validationMessage = validationMessage;
        }
    }

    read() {
        this.props.onRead();
    }

    render() {
        const nonBreakingSpace = '\u00A0';
        // Delaying the creation of TextareaAutosize etc until they're needed
        // gives a performance win.
        // This matters when we get rapidly rerendered, e.g. during an animation.
        let child;

        if (!this.editing) {
            this.value = this.props.value;
        }

        const readButton = this.props.showReadButton ? (
            <div
                className="btn btn-primary btn-xs btn-nordic"
                title="Read"
                onClick={this.onReadButtonClick}
                role="button"
                tabIndex={0}
            >
                <i className="icon-ccw" />
            </div>
        ) : null;

        if (this.props.plain) {
            child = (
                <TextArea
                    id="editable-field"
                    ref={editableTextarea => { this.editableTextarea = editableTextarea; }}
                    label={this.props.label}
                    title={this.props.title}
                    onKeyDown={this.onKeyDown}
                    value={this.props.value}
                    onChange={this.onChange}
                    onClick={stopPropagation}
                />
            );
        } else if (this.editing && this.props.onWrite) {
            child = (
                <div className="editable-field-editor-wrap native-key-bindings">
                    <div className="alert-wrap">
                        <div
                            className="alert alert-danger tooltip top"
                            style={{ display: this.validationMessage === '' ? 'none' : 'block' }}
                        >
                            <div className="tooltip-arrow" />
                            {this.validationMessage}
                        </div>
                    </div>
                    <div
                        className="btn btn-primary btn-xs btn-nordic"
                        title="Write"
                        onClick={this.onWriteButtonClick}
                        role="button"
                        tabIndex={0}
                    >
                        <i className="icon-ok" />
                    </div>
                    <TextareaAutosize
                        ref={editableTextarea => { this.editableTextarea = editableTextarea; }}
                        minRows={1}
                        onKeyDown={this.onKeyDown}
                        title={this.props.title}
                        value={this.value}
                        onChange={this.onChange}
                        onClick={stopPropagation}
                    />
                </div>
            );
        } else if (this.props.showReadButton && this.props.onRead && this.props.onWrite) {
            child = (
                <div className="editable-field-editor-wrap">
                    <div
                        className="btn btn-primary btn-xs btn-nordic"
                        title="Read"
                        onClick={this.onReadButtonClick}
                        role="button"
                        tabIndex={0}
                    >
                        <i className="icon-ccw" />
                    </div>
                    <div
                        className="subtle-text editable"
                        onClick={this.toggleEditing}
                        role="button"
                        tabIndex={0}
                    >
                        <span>{this.value || nonBreakingSpace}</span>
                    </div>
                </div>
            );
        } else if (this.props.onRead && !this.props.onWrite) {
            child = (
                <div>
                    {readButton}
                    <div className="subtle-text">
                        <span>{this.value || nonBreakingSpace}</span>
                    </div>
                </div>
            );
        } else if (!this.props.onRead && !this.props.onWrite) {
            child = (
                <div
                    className="subtle-text"
                    title={this.props.title}
                    onClick={this.selectParent}
                    role="button"
                    tabIndex={0}
                >
                    <span>{this.value || nonBreakingSpace}</span>
                </div>
            );
        } else {
            child = (
                <div
                    className="subtle-text editable"
                    title={this.props.title}
                    onClick={this.selectParentAndToggleEditing}
                    role="button"
                    tabIndex={0}
                >
                    <span>{this.value || nonBreakingSpace}</span>
                </div>
            );
        }

        return (
            <div className="editable-field selectable">
                {child}
            </div>
        );
    }
}

EditableField.propTypes = {
    value: PropTypes.string.isRequired,
    onWrite: PropTypes.func,
    onRead: PropTypes.func,
    showReadButton: PropTypes.bool,
    insideSelector: PropTypes.string,
    title: PropTypes.string.isRequired,
    label: PropTypes.string,
    plain: PropTypes.bool,
    selectParent: PropTypes.func,
    keyPressValidation: PropTypes.func.isRequired,
    formatInput: PropTypes.func.isRequired,
    getValueArray: PropTypes.func.isRequired,
    completeValidation: PropTypes.func.isRequired,
    onBeforeBackspace: PropTypes.func.isRequired,
    onBeforeDelete: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

EditableField.defaultProps = {
    onWrite: null,
    onRead: null,
    showReadButton: false,
    insideSelector: null,
    label: null,
    plain: null,
    selectParent: null,
};

export default onClickOutside(EditableField);
