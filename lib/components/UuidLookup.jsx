/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */
/* eslint react/no-redundant-should-component-update: off */

'use strict';

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import PropTypes from 'prop-types';

import { getUuidName } from '../utils/uuid_definitions';

function formatUuid(value) {
    if (!value) {
        return value;
    }

    if (value.length > 8) {
        return `${value.slice(0, 8)}...`;
    }

    return value;
}

class UuidLookup extends React.Component {
    shouldComponentUpdate(nextProps) {
        const { uuidDefs } = this.props;
        return !(
            JSON.stringify(uuidDefs) === JSON.stringify(nextProps.uuidDefs)
        );
    }

    render() {
        const { title, onSelect, uuidDefs, pullRight } = this.props;

        const sorted = Object.keys(uuidDefs).sort(
            (a, b) => parseInt(a, 16) - parseInt(b, 16)
        );
        return (
            <div className="uuid-lookup">
                <Dropdown
                    className="uuid-dropdown"
                    id="dropdownUuidLookup"
                    title={title}
                    onSelect={(eventKey, event) => onSelect(event, eventKey)}
                    alignRight={pullRight}
                >
                    <Dropdown.Toggle variant="secondary" size="lg">
                        <span className="mdi mdi-magnify" aria-hidden="true" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="scroll-menu">
                        <Dropdown.Header key="header0">{title}</Dropdown.Header>
                        {sorted.map(uuid => (
                            <Dropdown.Item
                                key={uuid}
                                title={`${uuid}: ${getUuidName(uuid)}`}
                                eventKey={uuid}
                            >
                                {`${formatUuid(uuid)}: ${getUuidName(uuid)}`}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
}

UuidLookup.propTypes = {
    title: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    uuidDefs: PropTypes.object.isRequired,
    pullRight: PropTypes.bool,
};

UuidLookup.defaultProps = {
    title: 'Predefined UUIDs',
    pullRight: true,
};

export default UuidLookup;
