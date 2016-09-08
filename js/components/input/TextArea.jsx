import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';

class TextArea extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        labelClassName: PropTypes.string,
        wrapperClassName: PropTypes.string
    };

    static defaultProps = {
        labelClassName: 'col-md-3 text-right',
        wrapperClassName: 'col-md-9'
    };

    render() {
        const { id, label, labelClassName, wrapperClassName, ...props } = this.props;

        return (
            <FormGroup controlId={id}>
                {
                    label && <ControlLabel className={labelClassName}>{label}</ControlLabel>
                }
                <InputGroup className={wrapperClassName}>
                    <FormControl componentClass="textarea" {...props} />
                </InputGroup>
            </FormGroup>
        );
    }
}

export default TextArea;
