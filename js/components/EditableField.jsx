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

import TextareaAutosize from 'react-textarea-autosize';
import $ from 'jquery';

let EditableField = React.createClass({
    /*
    Produces some text that changes into a textarea when clicked, OR if plain={true}, it simply produces a textarea.
    Exposes various events for validation and formatting.

    Usage:
    <EditableField value={value}
        keyPressValidation={keyPressValidation} completeValidation={completeValidation}
                    onBeforeBackspace={onBeforeBackspace} formatInput={formatInput} insideSelector=".some-selector" />
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
    mixins: [
        require('react-onclickoutside')
    ],
    handleClickOutside: function(e) {
        if (this.state.editing) {
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
            this.setState({
                value: this.props.value, //reset textarea value
                editing: false,
                validationMessage: ""
            });
        }
    },
    getInitialState: function() {
        return {
            editing: false,
            value: this.props.value,
            validationMessage: ""
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (!this.state.editing && this.props.value !== nextProps.value) {
            this.setState({ value: nextProps.value });
        }
    },
    _toggleEditing: function(e) {
        e.stopPropagation();
        this.setState({editing: !this.state.editing});
    },
    _onChange: function(e) {
        let textarea = e.target;
        let caretPosition = textarea.selectionStart;
        const valid = this.props.keyPressValidation ? this.props.keyPressValidation(textarea.value) : true;

        if (valid) {
            let value = e.target.value;
            if (this.props.formatInput) {
                ({ value, caretPosition } = this.props.formatInput(value, caretPosition));
            }
            this.setState({value: value, validationMessage: ""}, () =>
                textarea.setSelectionRange(caretPosition, caretPosition));
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        } else {
            this.setState({}, () =>
                textarea.setSelectionRange(caretPosition-1, caretPosition-1));
        }
    },
    _onKeyDown: function(e) {
        if (e.key === "Backspace" && this.props.onBeforeBackspace) {
            this.props.onBeforeBackspace(e);
        }
        if (e.key === "Enter") {
            this._saveChanges();
            e.preventDefault();
        }
    },
    _onOkButtonClick: function(e) {
        e.stopPropagation();
        this._saveChanges();
    },
    _onReadButtonClick(e) {
        e.stopPropagation()
        this._read();
    },
    _saveChanges: function() {
        const valid = this.props.completeValidation ? this.props.completeValidation(this.state.value) : true;
        if (valid) {
            this.setState({editing: false});
            if (this.props.onSaveChanges) {
                this.props.onSaveChanges(this.props.getValueArray(this.state.value));
            }
        }
    },
    _read() {
        console.log('read button pressed!');
    },
    _stopPropagation: function(e) {
        e.stopPropagation();
    },
    render: function() {
        const nonBreakingSpace = "\u00A0";
        //Delaying the creation of TextareaAutosize etc until they're needed gives a performance win.
        //This matters when we get rapidly rerendered, e.g. during an animation.
        let child;
        if (this.props.plain) {
            child = <TextareaAutosize {...this.props} ref="editableTextarea" minRows={1} onKeyDown={this._onKeyDown} value={this.state.value} onChange={this._onChange} onClick={this._stopPropagation}></TextareaAutosize>
        } else if (this.state.editing) {
            child = <div className="editable-field-editor-wrap">
                        <div className="alert-wrap">
                            <div className="alert alert-danger tooltip top" style={{display: this.state.validationMessage == '' ? 'none' : 'block' }}>
                                <div className="tooltip-arrow"></div>
                                {this.state.validationMessage}
                            </div>
                        </div>
                        <div className="btn btn-primary btn-xs btn-nordic" onClick={this._onOkButtonClick}><i className="icon-ok"></i></div>
                        <TextareaAutosize {...this.props} ref="editableTextarea" minRows={1} onKeyDown={this._onKeyDown} value={this.state.value} onChange={this._onChange} onClick={this._stopPropagation}></TextareaAutosize>
                    </div>
        } else if (this.props.showReadButton) {
            child = <div className="editable-field-editor-wrap">
                        <div className="btn btn-primary btn-xs btn-nordic" onClick={this._onReadButtonClick}><i className="icon-ccw"></i></div>
                        <div className="subtle-text editable" onClick={this._toggleEditing}>
                            <span>{this.state.value || nonBreakingSpace}</span>
                        </div>
                    </div>
        } else {
            child = <div className="subtle-text editable" onClick={this._toggleEditing}>
                        <span>{this.state.value || nonBreakingSpace}</span>
                    </div>
        }
        return (
            <div className="editable-field">
                {child}
            </div>
        );
    }
});

module.exports = EditableField;
