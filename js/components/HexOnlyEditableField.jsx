import EditableField from './EditableField.jsx';

var HexOnlyEditableField = React.createClass({
    _hexRegEx: /^[0-9a-f\-]*$/i,
    _keyPressValidation(str) {
        return this._hexRegEx.test(str);
    },
    _formatInput(str) {
        var chars = str.toUpperCase().replace(/-/g, "").split("");
        //insert dashes after every second char
        var inserted = 0;
        for (var i = 2, j = chars.length; i < j; i += 2) {
            chars.splice(i+inserted, 0, "-");
            inserted += 1;
        }
        return chars.join("");
    },
    _completeValidation(str) {
        var isFullbytes = str.replace(/-/g, "").length % 2 === 0;
        if (!isFullbytes) {
            this.refs.editableField.setState({validationMessage: "Please enter full bytes (pairs of hexadecimals)"});
        }
        return isFullbytes;
    },
    render() {
        return <EditableField {...this.props} 
                    keyPressValidation={this._keyPressValidation} completeValidation={this._completeValidation} 
                    formatInput={this._formatInput} ref="editableField"/>;
    }
});


module.exports = HexOnlyEditableField;