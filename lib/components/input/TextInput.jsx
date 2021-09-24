/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';

const SUCCESS = 'success';
const ERROR = 'error';

const TextInput = props => {
    const {
        id,
        inline,
        validationState,
        label,
        labelClassName,
        wrapperClassName,
        buttonAfter,
        value,
        ...newProps
    } = props;
    const classProp = inline && { className: 'form-inline' };
    const realValue = `${value}`;

    if (validationState === SUCCESS) {
        newProps.isValid = true;
    }
    if (validationState === ERROR) {
        newProps.isInvalid = true;
    }

    return (
        <Form.Group controlId={id} {...classProp}>
            {label && (
                <Form.Label className={labelClassName}>{label}</Form.Label>
            )}
            <InputGroup className={wrapperClassName}>
                <Form.Control value={realValue} {...newProps} />
                {buttonAfter && (
                    <InputGroup.Append>{buttonAfter}</InputGroup.Append>
                )}
            </InputGroup>
        </Form.Group>
    );
};

TextInput.propTypes = {
    buttonAfter: PropTypes.node,
    className: PropTypes.string,
    hasFeedback: PropTypes.bool,
    id: PropTypes.string,
    inline: PropTypes.bool,
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    title: PropTypes.string,
    validationState: PropTypes.string,
    wrapperClassName: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

TextInput.defaultProps = {
    buttonAfter: null,
    className: null,
    hasFeedback: false,
    id: '',
    inline: true,
    label: '',
    labelClassName: 'col-md-3 text-right',
    onChange: null,
    placeholder: '',
    title: null,
    validationState: null,
    value: null,
    wrapperClassName: 'col-md-9',
};

export default TextInput;
