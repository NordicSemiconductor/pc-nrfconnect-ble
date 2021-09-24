/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';

const SelectList = props => {
    const {
        children,
        id,
        inline,
        label,
        labelClassName,
        wrapperClassName,
        ...newProps
    } = props;

    const classProp = inline && { className: 'form-inline' };
    return (
        <Form.Group controlId={id} {...classProp}>
            {label && (
                <Form.Label className={labelClassName}>{label}</Form.Label>
            )}
            <InputGroup className={wrapperClassName}>
                <Form.Control as="select" {...newProps}>
                    {children}
                </Form.Control>
            </InputGroup>
        </Form.Group>
    );
};

SelectList.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string,
    inline: PropTypes.bool,
    label: PropTypes.string.isRequired,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
};

SelectList.defaultProps = {
    id: '',
    inline: true,
    labelClassName: 'col-md-3 text-right',
    wrapperClassName: 'col-md-9',
};

export default SelectList;
