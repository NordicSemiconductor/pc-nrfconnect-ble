import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';

const TextInput = ({
    id,
    label,
    hasFeedback,
    validationState,
    buttonAfter,
    labelClassName,
    wrapperClassName,
    inline,
    title,
    className,
    defaultValue,
    onChange,
    placeholder,
}) => {
    const bsClassProp = inline && { bsClass: 'form-inline' };

    return (
        <FormGroup controlId={id} validationState={validationState} {...bsClassProp}>
            {
                label && <ControlLabel className={labelClassName}>{label}</ControlLabel>
            }
            <InputGroup className={wrapperClassName}>
                <FormControl
                    title={title}
                    className={className}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    placeholder={placeholder}
                />
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
};

export default TextInput;
