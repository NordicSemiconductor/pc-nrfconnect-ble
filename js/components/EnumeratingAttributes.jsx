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

import React from 'react';

import Component from 'react-pure-render/component';

export default class EnumeratingAttributes extends Component {
    render() {
        const barList = [];

        for (let i = 0; i < this.props.bars; i++) {
            barList.push(<div key={'bar' + (i + 1)} className={'bar' + (i + 1)} />);
        }

        return (
            <div className='enumerating-items-wrap'>
                {barList}
                <div className='enumerating-content'>
                    <img className='spinner center-block' src='resources/ajax-loader.gif' height='20' width='20' />
                </div>
            </div>
        );
    }
}
