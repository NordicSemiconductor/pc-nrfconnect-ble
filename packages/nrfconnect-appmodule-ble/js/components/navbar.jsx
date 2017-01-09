/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React from 'react';

import logo from 'nrfconnect-core/resources/nordiclogo_neg.png';
import AdapterSelector from './AdapterSelector';

export default class NavBar extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeStyle: { boxShadow: 'inset 0 5px 10px #133e40' },
            passiveStyle: {},
            adapterState: { connected: false },
        };
    }

    _onViewChange(newView) {
        this.props.onChangeMainView(newView);
    }

    _getClassForTabButton(itemName) {
        return 'btn btn-primary btn-nordic padded-row' + (this.props.view === itemName ? ' active' : '');
    }

    componentDidMount() {
        const { onChangeMainView } = this.props;

        window.addEventListener('core:connection-map', () => { onChangeMainView('ConnectionMap'); });
        window.addEventListener('core:server-setup', () => { onChangeMainView('ServerSetup'); });
    }

    render() {
        return (
            <div className='nav-bar'>
                <div>
                    <a href='http://www.nordicsemi.com/nRFConnect' target='_blank'><img className='nrfconnect-logo' src={logo} /></a>
                </div>
                <div className='nav-section'>
                    <div className='padded-row'>
                        <AdapterSelector/>
                    </div>
                </div>
                <div className='nav-section bl padded-row'>
                    <button title='Connection map (Alt+1)' onClick={this._onViewChange.bind(this, 'ConnectionMap')}  className={this._getClassForTabButton('ConnectionMap')}>
                        <span className='icon-columns' />
                        <span>Connection map</span>
                    </button>
                    <button title='Server setup (Alt+2)' onClick={this._onViewChange.bind(this, 'ServerSetup')}  className={this._getClassForTabButton('ServerSetup')}>
                        <span className='icon-indent-right' />
                        <span>Server setup</span>
                    </button>
                </div>
            </div>
        );
    }
}
