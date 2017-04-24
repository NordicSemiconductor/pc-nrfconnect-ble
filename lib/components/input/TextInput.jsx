import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';

const TextInput = props => {
    const {
        id,
        inline,
        validationState,
        label,
        labelClassName,
        wrapperClassName,
        hasFeedback,
        buttonAfter,
        value,
        defaultValue,
        ...newProps
    } = props;
    const bsClassProp = inline && { bsClass: 'form-inline' };

    const realValue = `${value || defaultValue}`;

    return (
        <FormGroup controlId={id} validationState={validationState} {...bsClassProp}>
            {
                label && <ControlLabel className={labelClassName}>{label}</ControlLabel>
            }
            <InputGroup className={wrapperClassName}>
                <FormControl value={realValue} {...newProps} />
                { hasFeedback && <FormControl.Feedback /> }
                { buttonAfter && <InputGroup.Button>{ buttonAfter }</InputGroup.Button> }
            </InputGroup>
        </FormGroup>
    );
};

TextInput.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    validationState: PropTypes.string,
    buttonAfter: PropTypes.node,
    hasFeedback: PropTypes.bool,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    inline: PropTypes.bool,
    title: PropTypes.string,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

TextInput.defaultProps = {
    id: '',
    label: '',
    validationState: null,
    buttonAfter: null,
    hasFeedback: false,
    labelClassName: 'col-md-3 text-right',
    wrapperClassName: 'col-md-9',
    inline: true,
    title: null,
    className: null,
    defaultValue: '',
    placeholder: '',
    value: null,
};

export default TextInput;
