import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';

class LabeledInputGroup extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        labelClassName: PropTypes.string,
        wrapperClassName: PropTypes.string
    };

    static defaultProps = {
        labelClassName: 'col-md-3 text-right',
        wrapperClassName: 'col-md-9'
    };

    render() {
        const { label, children, labelClassName, wrapperClassName } = this.props;
        return (
            <FormGroup>
                <ControlLabel className={labelClassName}>{label}</ControlLabel>
                <InputGroup className={wrapperClassName}>
                    {children}
                </InputGroup>
            </FormGroup>
        );
    }
}

export default LabeledInputGroup;
