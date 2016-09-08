/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React, { PropTypes } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { uuidDefinitions, getUuidName } from '../utils/uuid_definitions';

export default class UuidLookup extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !(JSON.stringify(this.props.uuidDefs) === JSON.stringify(nextProps.uuidDefs));
    }

    formatUuid(value) {
        if (!value) { return value; }

        if (value.length > 8) {
            return value.slice(0, 8) + '... ';
        }

        return value;
    }

    render() {
        const {
            title,
            onSelect,
            uuidDefs,
            pullRight,
        } = this.props;

        const sorted = Object.keys(uuidDefs).sort((a, b) => { return parseInt(a, 16) - parseInt(b, 16); });

        return (
            <div className='uuid-lookup'>
                <Dropdown className='uuid-dropdown' id='dropdown-uuid-lookup' title={title}
                    onSelect={(eventKey, event) => onSelect(event, eventKey)}
                    pullRight={pullRight}>
                    <Dropdown.Toggle noCaret>
                        <span className='icon-search' aria-hidden='true' />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className='scroll-menu'>
                        <MenuItem header key='header0'>{title}</MenuItem>
                        {
                            sorted.map((uuid, index) => {
                                return (
                                    <MenuItem
                                        key={index}
                                        title={uuid + ': ' + getUuidName(uuid)}
                                        eventKey={uuid}
                                    >
                                        {this.formatUuid(uuid) + ': ' + getUuidName(uuid)}
                                    </MenuItem>
                                );
                            })
                        }
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
    uuidDefs: uuidDefinitions(),
    pullRight: false,

};
