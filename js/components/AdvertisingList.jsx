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
import AdvertisingListEntry from './AdvertisingListEntry';

export default class AdvertisingList extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            title,
            advEntries,
            onDelete,
        } = this.props;

        return (
            <div className='adv-table-container'>
                <div className='adv-header'>{title}</div>
                <table className='table-striped'>
                    <thead>
                        <tr>
                            <th>AD type</th>
                            <th>Value</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {advEntries.map(entry =>
                            <AdvertisingListEntry {...{entry}} key={entry.id}
                                onDelete={onDelete} />)}
                    </tbody>
                </table>
            </div>
        );
    }
}

AdvertisingList.propTypes = {
    title: PropTypes.string.isRequired,
    advEntries: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};
