import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';

export default class ReadOnlyField extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.string.isRequired,
        labelClassName: PropTypes.string,
        wrapperClassName: PropTypes.string
    };

    static defaultProps = {
        labelClassName: 'col-md-3 text-right',
        wrapperClassName: 'col-md-9'
    };

    render() {
        const { id, label, labelClassName, wrapperClassName, value } = this.props;

        return (
            <FormGroup controlId={id}>
                {
                    label && <ControlLabel className={labelClassName}>{label}</ControlLabel>
                }
                <InputGroup className={wrapperClassName}>
                    <pre>{value}</pre>
                </InputGroup>
            </FormGroup>
        );
    }
}
