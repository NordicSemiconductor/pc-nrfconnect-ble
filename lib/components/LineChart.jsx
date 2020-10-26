/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useEffect, useRef } from 'react';
import { arrayOf, shape, number, string } from 'prop-types';
import Chart from 'chart.js';

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
