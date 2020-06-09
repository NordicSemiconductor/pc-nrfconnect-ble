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

/* eslint react/forbid-prop-types: off */
/* eslint react/no-redundant-should-component-update: off */

'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import { getUuidName } from '../utils/uuid_definitions';

function formatUuid(value) {
    if (!value) {
        return value;
    }

    if (value.length > 8) {
        return `${value.slice(0, 8)}...`;
    }

    return value;
}

class UuidLookup extends React.Component {
    shouldComponentUpdate(nextProps) {
        const { uuidDefs } = this.props;
        return !(JSON.stringify(uuidDefs) === JSON.stringify(nextProps.uuidDefs));
    }

    render() {
        const {
            title,
            onSelect,
            uuidDefs,
            pullRight,
        } = this.props;

        const sorted = Object.keys(uuidDefs).sort((a, b) => parseInt(a, 16) - parseInt(b, 16));
        return (
            <div className="uuid-lookup">
                <Dropdown
                    className="uuid-dropdown"
                    id="dropdownUuidLookup"
                    title={title}
                    onSelect={(eventKey, event) => onSelect(event, eventKey)}
                    alignRight={pullRight}
                >
                    <Dropdown.Toggle variant="outline-secondary" size="lg">
                        <span className="mdi mdi-magnify" aria-hidden="true" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="scroll-menu">
                        <Dropdown.Header key="header0">{title}</Dropdown.Header>
                        {
                            sorted.map(uuid => (
                                <Dropdown.Item
                                    key={uuid}
                                    title={`${uuid}: ${getUuidName(uuid)}`}
                                    eventKey={uuid}
                                >
                                    {`${formatUuid(uuid)}: ${getUuidName(uuid)}`}
                                </Dropdown.Item>
                            ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
}

UuidLookup.propTypes = {
    title: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    uuidDefs: PropTypes.object.isRequired,
    pullRight: PropTypes.bool,
};

UuidLookup.defaultProps = {
    title: 'Predefined UUIDs',
    pullRight: true,
};

export default UuidLookup;
