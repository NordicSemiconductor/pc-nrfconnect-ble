/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

class AdvertisingListEntry extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onButtonClicked = this.onButtonClicked.bind(this);
    }

    onButtonClicked() {
        const { entry, onDelete } = this.props;
        onDelete(entry.id);
    }

    render() {
        const { entry } = this.props;
        return (
            <tr>
                <td>{entry.type}</td>
                <td>{entry.value}</td>
                <td>
                    <Button
                        className="mdi mdi-close-circle adv-data-delete"
                        size="sm"
                        onClick={this.onButtonClicked}
                        variant="secondary"
                    >
                        {' Delete'}
                    </Button>
                </td>
            </tr>
        );
    }
}

AdvertisingListEntry.propTypes = {
    entry: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default AdvertisingListEntry;
