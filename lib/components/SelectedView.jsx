/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
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

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import DeviceDetailsContainer from '../containers/DeviceDetails';
import ServerSetup from '../containers/ServerSetup';

const DEVICE_DETAILS_VIEW_ID = 0;
const SERVER_SETUP_VIEW_ID = 1;

class SelectedView extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            windowHeight: window.innerHeight,
        };
    }

    componentWillMount() {
        (() => {
            const throttle = (type, name, obj) => {
                let running = false;
                const object = obj || window;
                const func = () => {
                    if (running) {
                        return;
                    }

                    running = true;
                    requestAnimationFrame(() => {
                        object.dispatchEvent(new CustomEvent(name));
                        running = false;
                    });
                };

                object.addEventListener(type, func);
            };

            throttle('resize', 'optimizedResize');
        })();

        // handle event
        window.addEventListener('optimizedResize', () => {
            this.setState({ windowHeight: window.innerHeight });
        });
    }

    render() {
        const { viewId } = this.props;
        const { windowHeight } = this.state;
        const topBarHeight = 55;
        const layoutStyle = { height: windowHeight - topBarHeight };
        const mainAreaHeight = layoutStyle.height - 189;

        if (viewId === DEVICE_DETAILS_VIEW_ID) {
            return <DeviceDetailsContainer style={{ height: mainAreaHeight }} />;
        } if (viewId === SERVER_SETUP_VIEW_ID) {
            return <ServerSetup style={{ height: mainAreaHeight }} />;
        }
        return null;
    }
}

SelectedView.propTypes = {
    viewId: PropTypes.number.isRequired,
};

export default SelectedView;
