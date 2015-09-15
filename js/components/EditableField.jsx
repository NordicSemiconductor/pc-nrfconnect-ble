var TextareaAutosize = require('react-textarea-autosize');

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
    _toggleEditing: function() {
        this.setState({editing: !this.state.editing});
    },
    _onChange: function(e) {
        this.setState({value: e.target.value});
    },
    _onKeyDown: function(e) {
        if (e.key === "Enter") {
            this._saveChanges();
            e.preventDefault();
        }
    },
    _saveChanges: function() {
        this.setState({editing: false});
        this.props.value = this.refs.editableTextarea.value;
        if (this.props.onSaveChanges) {
            this.props.onSaveChanges(this.props.value);
        }
    },
    render: function() {
        return (
            <div>
                <div className="subtle-text editable" onClick={this._toggleEditing}  style={{display: this.state.editing ? "none" : "block"}}>
                    <span>{this.props.value}</span>
                </div>
                <div style={{display: this.state.editing ? "block" : "none"}}>
                    <div className="btn btn-primary btn-xs btn-nordic" onClick={this._saveChanges}><i className="icon-ok"></i></div>
                    <TextareaAutosize ref="editableTextarea" minRows="1" onKeyDown={this._onKeyDown} value={this.state.value} onChange={this._onChange}></TextareaAutosize>
                </div>
            </div>
        );
    }
});
module.exports = EditableField;