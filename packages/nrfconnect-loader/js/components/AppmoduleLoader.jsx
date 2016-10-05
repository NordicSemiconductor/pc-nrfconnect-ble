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

import '../../css/components/appmodule-loader.less';
import logo from 'nrfconnect-core/resources/nrfconnect_neg.png';

import React, { PropTypes } from 'react';
import { Checkbox } from 'react-bootstrap';
import Immutable from 'immutable';
import AppmoduleList from './AppmoduleList';

export default class AppmoduleLoader extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        appmodules: PropTypes.instanceOf(Immutable.List).isRequired,
        onAppmoduleSelected: PropTypes.func.isRequired
    };

    render() {
        const { appmodules, onAppmoduleSelected } = this.props;

        return (
            <div>
                <div className='appmodule-loader'>
                    <div>
                        <a href='http://www.nordicsemi.com/nRFConnect' target='_blank'>
                            <img className='appmodule-loader-logo' src={logo} />
                        </a>
                    </div>
                    <div className='appmodule-loader-heading'>
                        <h4>nRF Connect</h4>
                    </div>
                </div>
                <div className="panel-body">
                    <AppmoduleList appmodules={appmodules} onAppmoduleSelected={onAppmoduleSelected} />
                    <Checkbox checked={false}>Remember my choice</Checkbox>
                </div>
            </div>
        );
    }
}
