import TextareaAutosize from 'react-textarea-autosize';
import $ from 'jquery';

var EditableField = React.createClass({
    mixins: [
        require('react-onclickoutside')
    ],
    handleClickOutside: function(e) {
        if (this.state.editing) {
            if (this.insideParent) {
                //dont close if click was within a parent element that matches insideSelector
                if (e.path.includes(this.insideParent)) {
                    return;
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
    componentDidMount: function() {
        if (this.props.insideSelector) {
            var elem = $(React.findDOMNode(this.refs.editableTextarea)).parents(this.props.insideSelector);
            this.insideParent = elem.length > 0 ? elem[0] : null; 
        }
    },
    componentWillUnmount: function() {
        this.insideParent = null; //avoid leaking memory
    },
    _toggleEditing: function(e) {
        e.stopPropagation();
        this.setState({editing: !this.state.editing});
    },
    _onChange: function(e) {
        var textarea = e.target;
        var caretPosition = this.caretPosition !== null ? this.caretPosition : textarea.selectionStart;
        var valid = this.props.keyPressValidation ? this.props.keyPressValidation(textarea.value) : true;
        if (valid) {
            var value = e.target.value;
            if (this.props.formatInput) {
                ({ value, caretPosition } = this.props.formatInput(value, caretPosition));
            }
            this.setState({value: value, validationMessage: ""}, () => 
                textarea.setSelectionRange(caretPosition, caretPosition));
        } else {
            this.setState({}, () => 
                textarea.setSelectionRange(caretPosition-1, caretPosition-1));
        }
    },
    _onKeyDown: function(e) {
        this.caretPosition = null;
        if (e.key === "Backspace" && this.props.onBackspace) {
            this.caretPosition = this.props.onBackspace(e);
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
    _saveChanges: function() {
        var valid = this.props.completeValidation ? this.props.completeValidation(this.state.value) : true;
        if (valid) {
            this.setState({editing: false});
            if (this.props.onSaveChanges) {
                this.props.onSaveChanges(this.props.value);
            }
        }
    },
    _stopPropagation: function(e) {
        e.stopPropagation();
    },
    render: function() {
        var nonBreakingSpace = "\u00A0";
        return (
            <div className="editable-field">
                <div className="subtle-text editable" onClick={this._toggleEditing}  style={{display: this.state.editing ? "none" : "block"}}>
                    <span>{this.state.value || nonBreakingSpace}</span>
                </div>
                <div className="editable-field-editor-wrap" style={{display: this.state.editing ? "block" : "none"}}>
                    <div className="alert-wrap">
                        <div className="alert alert-danger tooltip top" style={{display: this.state.validationMessage == '' ? 'none' : 'block' }}>
                            <div className="tooltip-arrow"></div>
                            {this.state.validationMessage}
                        </div>
                    </div>
                    <div className="btn btn-primary btn-xs btn-nordic" onClick={this._onOkButtonClick}><i className="icon-ok"></i></div>
                    <TextareaAutosize ref="editableTextarea" minRows="1" onKeyDown={this._onKeyDown} value={this.state.value} onChange={this._onChange} onClick={this._stopPropagation}></TextareaAutosize>
                </div>
            </div>
        );
    }
});

module.exports = EditableField;