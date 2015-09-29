import EditableField from './EditableField.jsx';

var HexOnlyEditableField = React.createClass({
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
    _hexRegEx: /^[0-9a-f\-]*$/i,
    _keyPressValidation(str) {
        return this._hexRegEx.test(str);
    },
    _formatInput(str, caretPosition) {
        caretPosition = this._calcCaretPosition(str, caretPosition);
        var chars = str.toUpperCase().replace(/-/g, "").split("");
        //insert dashes after every second char
        var inserted = 0;
        for (var i = 2, j = chars.length; i < j; i += 2) {
            chars.splice(i+inserted, 0, "-");
            inserted += 1;
        }
        return { 
            value: chars.join(""), 
            caretPosition: caretPosition
        }
    },
    _onBeforeBackspace(e) {
        //when backspace will remove a dash, also remove the character before the dash
        var str = e.target.value;
        var caret = e.target.selectionStart;
        if (str.substr(caret-1, 1) === "-") {
            //remove the dash - this sets the caret at end of the text
            e.target.value = str.slice(0, caret-1) + str.slice(caret, str.length);
            //reset the caret back to before the dash, so the backspace event itself will remove the char before the dash
            e.target.setSelectionRange(caret-1, caret-1); 
        }
    },
    _calcCaretPosition(origValue, caretPosition) {
        /*Replacing the textarea contents places the caret at the end.
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
        var dashesBeforeCaret = origValue.substr(0, caretPosition).match(/-/g)
        var numDashesBeforeCaret = dashesBeforeCaret === null ? 0 : dashesBeforeCaret.length
        var caretPositionWithoutDashes = caretPosition - numDashesBeforeCaret;
        var correctNumberOfDashes = Math.floor(caretPositionWithoutDashes/2);
        caretPosition = caretPositionWithoutDashes + correctNumberOfDashes;
        return caretPosition;
    },
    _onChange(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    },
    _completeValidation(str) {
        var isFullbytes = str.replace(/-/g, "").length % 2 === 0;
        if (!isFullbytes) {
            this.refs.editableField.setState({validationMessage: "Please enter full bytes (pairs of hexadecimals)"});
        }
        return isFullbytes;
    },
    render() {
        var {keyPressValidation, completeValidation, onBackspace, formatInput, onChange, ...props} = this.props; //pass along all props except these
        return <EditableField {...props} 
                    keyPressValidation={this._keyPressValidation} completeValidation={this._completeValidation} 
                    onBeforeBackspace={this._onBeforeBackspace} formatInput={this._formatInput} onChange={this._onChange} ref="editableField"/>;
    }
});


module.exports = HexOnlyEditableField;