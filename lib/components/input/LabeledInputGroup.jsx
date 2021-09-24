/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';

const LabeledInputGroup = props => {
    const { children, inline, label, labelClassName, wrapperClassName } = props;
    const classProp = inline && { className: 'form-inline' };
    return (
        <Form.Group {...classProp}>
            <Form.Label className={labelClassName}>{label}</Form.Label>
            <InputGroup className={wrapperClassName}>{children}</InputGroup>
        </Form.Group>
    );
};

LabeledInputGroup.propTypes = {
    children: PropTypes.node.isRequired,
    inline: PropTypes.bool,
    label: PropTypes.string.isRequired,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
};

LabeledInputGroup.defaultProps = {
    inline: true,
    labelClassName: 'col-md-3 text-right',
    wrapperClassName: 'col-md-9',
};

export default LabeledInputGroup;
