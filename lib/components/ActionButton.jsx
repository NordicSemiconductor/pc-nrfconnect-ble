/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const ActionButton = ({ label, onClick, primary, className, ...rest }) => (
    <Button
        type="button"
        onClick={onClick}
        className={`${className} btn btn-default btn-sm btn-nordic`}
        variant={primary ? 'primary' : 'secondary'}
        {...rest}
    >
        {label}
    </Button>
);

ActionButton.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    primary: PropTypes.bool,
};

ActionButton.defaultProps = {
    primary: false,
    className: '',
};

export default ActionButton;
