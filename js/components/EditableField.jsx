import TextareaAutosize from 'react-textarea-autosize';

var EditableField = React.createClass({
    mixins: [
        require('react-onclickoutside')
    ],
    handleClickOutside: function(e) {
        if (this.state.editing) {
            this.setState({
                value: this.props.value, //reset textarea value
                editing: false
            });
        }
    },
    getInitialState: function() {
        return {
            editing: false,
            value: this.props.value
        };
    },
    _toggleEditing: function(e) {
        e.stopPropagation();
        this.setState({editing: !this.state.editing});
    },
    _onChange: function(e) {
        var valid = this.props.keyPressValidation ? this.props.keyPressValidation(e.target.value) : true;
        if (valid) {
            var value = this.props.formatInput ?  this.props.formatInput(e.target.value) : e.target.value;
            this.setState({value: value});
        }
    },
    _onKeyDown: function(e) {
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
        this.setState({editing: false});
        if (this.props.onSaveChanges) {
            this.props.onSaveChanges(this.props.value);
        }
    },
    _stopPropagation: function(e) {
        e.stopPropagation();
    },
    render: function() {
        return (
            <div>
                <div className="subtle-text editable" onClick={this._toggleEditing}  style={{display: this.state.editing ? "none" : "block"}}>
                    <span>{this.state.value}</span>
                </div>
                <div style={{display: this.state.editing ? "block" : "none"}}>
                    <div className="btn btn-primary btn-xs btn-nordic" onClick={this._onOkButtonClick}><i className="icon-ok"></i></div>
                    <TextareaAutosize ref="editableTextarea" minRows="1" onKeyDown={this._onKeyDown} value={this.state.value} onChange={this._onChange} onClick={this._stopPropagation}></TextareaAutosize>
                </div>
            </div>
        );
    }
});

module.exports = EditableField;