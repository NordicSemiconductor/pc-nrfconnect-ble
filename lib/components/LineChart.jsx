/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';
import { arrayOf, number, shape, string } from 'prop-types';

const LineChart = ({ data, xTotal, xAxisLabel, height }) => {
    const chartRef = useRef(null);
    const axis = {
        type: 'linear',
        ticks: { min: 0, padding: 6 },
        gridLines: {
            drawOnChartArea: false,
            lineWidth: 2,
            zeroLineWidth: 2,
            tickMarkLength: 6,
        },
    };

    useEffect(() => {
        // componentDidMount
        chartRef.current.chart = new Chart(chartRef.current, {
            type: 'line',
            options: {
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    xAxes: [
                        {
                            ...axis,
                            ticks: { ...axis.ticks, max: Math.round(xTotal) },
                            scaleLabel: {
                                display: true,
                                labelString: xAxisLabel,
                                fontStyle: 'bold',
                            },
                        },
                    ],
                    yAxes: [axis],
                },
            },
            data: {
                datasets: data.map(({ values, color }) => ({
                    data: values,
                    fill: 'none',
                    pointRadius: 0,
                    borderColor: color,
                    borderWidth: 2,
                    lineTension: 0.1,
                })),
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // componentDidUpdate
        const { chart } = chartRef.current;
        data.forEach(({ values }, index) => {
            chart.data.datasets[index].data = values;
        });
        chart.update();
    });

    return (
        <div style={{ height: `${height}px` }}>
            <canvas ref={chartRef} />
        </div>
    );
};

LineChart.propTypes = {
    data: arrayOf(
        shape({
            values: arrayOf(
                shape({
                    x: number.isRequired,
                    y: number.isRequired,
                })
            ),
            color: string.isRequired,
        })
    ).isRequired,
    xTotal: number.isRequired,
    xAxisLabel: string.isRequired,
    height: number.isRequired,
};

export default LineChart;
