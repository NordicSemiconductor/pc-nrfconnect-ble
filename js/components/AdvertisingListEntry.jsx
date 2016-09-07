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

import {Button} from 'react-bootstrap';

export default class AdvertisingListEntry extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            entry,
            onDelete,
        } = this.props;

        return (
            <tr>
                <td>{entry.type}</td>
                <td>{entry.value}</td>
                <td><Button className='icon-cancel-circled' bsSize='xsmall' onClick={() => onDelete(entry.id)}>{' Delete'}</Button></td>
            </tr>
        );
    }
}

AdvertisingListEntry.propTypes = {
    entry: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};
