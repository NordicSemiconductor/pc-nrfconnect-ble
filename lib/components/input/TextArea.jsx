/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';

/* eslint-disable react/prefer-stateless-function */

class TextArea extends React.Component {
    render() {
        const {
            id,
            inline,
            label,
            labelClassName,
            wrapperClassName,
            ...newProps
        } = this.props;

        const classProp = inline && { className: 'form-inline' };

        return (
            <Form.Group controlId={id} {...classProp}>
                {label && (
                    <Form.Label className={labelClassName}>{label}</Form.Label>
                )}
                <InputGroup className={wrapperClassName}>
                    <Form.Control as="textarea" {...newProps} />
                </InputGroup>
            </Form.Group>
        );
    }
}

TextArea.propTypes = {
    id: PropTypes.string.isRequired,
    inline: PropTypes.bool,
    label: PropTypes.string.isRequired,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
};

TextArea.defaultProps = {
    inline: true,
    labelClassName: 'col-md-3 text-right',
    wrapperClassName: 'col-md-9',
};

export default TextArea;
