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

/* eslint react/prop-types: off */
/* eslint jsx-a11y/no-static-element-interactions: off */
/* eslint no-underscore-dangle: off */

'use strict';

import _ from 'lodash';
import React from 'react';

class AddNewItem extends React.PureComponent {
    componentWillReceiveProps(nextProps) {
        // if we're selected through keyboard navigation, we need to make sure we're visible

        // btw: this _addBtnId can't be found anywhere, probably obsolete
        const selectedId = nextProps.selected && nextProps.selected._addBtnId;
        if (nextProps.id === selectedId && nextProps.onRequestVisibility) {
            nextProps.onRequestVisibility();
        }
    }

    render() {
        const bars = _.times(this.props.bars, i => <div className={`bar${i + 1}`} key={i} />);

        return (
            <div className="add-new" onClick={this.props.onClick}>
                {bars}
                <div className="content-wrap">
                    <div className="content padded-row">
                        <span className="icon-wrap">
                            <i className="icon-slim icon-plus-circled" />
                        </span>
                        <span>{this.props.text}</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddNewItem;
