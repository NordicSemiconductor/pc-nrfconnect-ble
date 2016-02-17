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
import Component from 'react-pure-render/component';

import moment from 'moment';

function entryClassName(entry) {
    switch (entry.level) {
        case 0:
            return 'log-trace';
        case 1:
            return 'log-debug';
        case 2:
            return 'log-info';
        case 3:
            return 'log-warning';
        case 4:
            return 'log-error';
        case 5:
            return 'log-fatal';
        default:
            return 'log-unknown';
    }
}

export default class LogEntry extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            entry,
            key,
        } = this.props;

        var className = 'log-entry ' + entryClassName(entry);
        var time = moment(new Date(entry.time)).format('HH:mm:ss.SSSS');

        return (
            <div className={className} key={key}>
                <div className='time'>{time}</div>
                <div className='message'>{entry.message}</div>
            </div>
        );
    }
}

LogEntry.propTypes = {
    entry: PropTypes.object.isRequired,
};
