import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';

class TextInput extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        validationState: PropTypes.string,
        buttonAfter: PropTypes.node,
        hasFeedback: PropTypes.bool,
        labelClassName: PropTypes.string,
        wrapperClassName: PropTypes.string,
        inline: PropTypes.bool
    };

    static defaultProps = {
        labelClassName: 'col-md-3 text-right',
        wrapperClassName: 'col-md-9'
    };

    render() {
        const { id, label, hasFeedback, validationState, buttonAfter, labelClassName, wrapperClassName, inline, ...props } = this.props;
        let bsClassProp = inline && {bsClass: 'form-inline'};

        return (
            <FormGroup controlId={id} validationState={validationState} {...bsClassProp}>
                {
                    label && <ControlLabel className={labelClassName}>{label}</ControlLabel>
                }
                <InputGroup className={wrapperClassName}>
                    <FormControl {...props} />
                    { hasFeedback && <FormControl.Feedback /> }
                    { buttonAfter && <InputGroup.Button>{ buttonAfter }</InputGroup.Button> }
                </InputGroup>
            </FormGroup>
        );
    }
}

export default TextInput;