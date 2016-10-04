import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { TextInput } from 'nrfconnect-core';

export default class FileInput extends React.PureComponent {
    static propTypes = {
        label: PropTypes.string,
        name: PropTypes.string,
        onChooseClicked: PropTypes.func,
        buttonDisabled: PropTypes.bool,
        value: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(event) {
        this.props.onChange(this.props.name, event.target.value);
    }

    render() {
        const { label, value, onChooseClicked, buttonDisabled, ...props } = this.props;
        const fileBrowseButton = (
            <Button disabled={buttonDisabled} onClick={onChooseClicked}>Choose</Button>
        );
        return <TextInput label={label} value={value} onChange={this.onChange} buttonAfter={fileBrowseButton} {...props} />;
    }
}
