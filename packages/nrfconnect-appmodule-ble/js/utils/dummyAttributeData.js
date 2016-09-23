/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

[
    {
        handle: 1,
        uuid: '0x1809',
        name: 'Health Thermometer',
        characteristics: [
        {
            name: 'Temperature',
            uuid: '0x2A1D',
            value: '37,5C',
        },
        {
            name: 'Measurement Interval',
            uuid: '0x2A1D',
            value: '300 sec',
            descriptors: [
            {
                name: 'Client Characteristic Configuration',
                uuid: '0x0028',
                value: '300 sec',
            },
        ],
        },
    ],
    },
];
