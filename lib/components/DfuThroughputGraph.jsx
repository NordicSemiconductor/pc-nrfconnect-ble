/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

import React from 'react';
import PropTypes from 'prop-types';

import LineChart from './LineChart';

const DfuThroughputGraph = ({ totalSizeKb, kbpsPoints, averageKbpsPoints }) =>
    kbpsPoints.length > 0 ? (
        <LineChart
            data={[
                {
                    values: averageKbpsPoints,
                    color: '#0080B7',
                },
                {
                    values: kbpsPoints,
                    color: '#6dcff6',
                },
            ]}
            xTotal={totalSizeKb}
            xAxisLabel="kB transferred"
            height={250}
        />
    ) : null;

DfuThroughputGraph.propTypes = {
    totalSizeKb: PropTypes.number.isRequired,
    kbpsPoints: PropTypes.arrayOf(
        PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        })
    ).isRequired,
    averageKbpsPoints: PropTypes.arrayOf(
        PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        })
    ).isRequired,
};

export default DfuThroughputGraph;
