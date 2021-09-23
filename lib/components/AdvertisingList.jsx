/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';

import AdvertisingListEntry from './AdvertisingListEntry';

const AdvertisingList = props => {
    const { title, advEntries, onDelete } = props;

    return (
        <div className="adv-table-container">
            <div className="adv-header">{title}</div>
            <table className="table-striped">
                <thead>
                    <tr>
                        <th>AD type</th>
                        <th>Value</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {advEntries.map(entry => (
                        <AdvertisingListEntry
                            {...{ entry }}
                            key={entry.id}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

AdvertisingList.propTypes = {
    title: PropTypes.string.isRequired,
    advEntries: PropTypes.instanceOf(List).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default AdvertisingList;
