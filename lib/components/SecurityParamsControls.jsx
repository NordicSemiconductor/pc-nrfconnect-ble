/* eslint-disable react/state-in-constructor */
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
/* eslint jsx-a11y/label-has-for: off */
/* eslint jsx-a11y/label-has-associated-control: off */
/* eslint-disable react/destructuring-assignment */

'use strict';

import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
const IO_CAPS_KEYBOARD_DISPLAY = 4;

function keyToIoCapsText(key) {
    switch (key) {
        case IO_CAPS_DISPLAY_ONLY:
            return 'Display, no keyboard';

        case IO_CAPS_DISPLAY_YESNO:
            return 'Display and yes no entry';

        case IO_CAPS_KEYBOARD_ONLY:
            return 'Keyboard, no display';

        case IO_CAPS_NONE:
            return 'No keyboard, no display';

        case IO_CAPS_KEYBOARD_DISPLAY:
            return 'Keyboard and display';

        default:
            return '';
    }
}

class SecurityParamsControls extends React.PureComponent {
    state = {
        io_caps: this.props.securityParams.io_caps,
        lesc: this.props.securityParams.lesc,
        mitm: this.props.securityParams.mitm,
        oob: this.props.securityParams.oob,
        keypress: this.props.securityParams.keypress,
        bond: this.props.securityParams.bond,
        io_caps_title: keyToIoCapsText(this.props.securityParams.io_caps),
    };

    onIoCapsSelect(_, eventKey) {
        const ioCaps = parseInt(eventKey, 10);
        this.setState(
            {
                io_caps: ioCaps,
                io_caps_title: keyToIoCapsText(ioCaps),
            },
            () => {
                this.props.onChange(this.state);
            }
        );
    }

    handleCheckboxChange(variableName, checked) {
        this.setState({ [variableName]: checked }, () => {
            this.props.onChange(this.state);
        });
    }

    render() {
        return (
            <Container>
                <Row className="form-group">
                    <Col sm={4} className="form-label text-right">
                        IO capabilities
                    </Col>
                    <Col sm={7}>
                        <DropdownButton
                            title={this.state.io_caps_title}
                            key="ioCapsDropdownKey"
                            id="ioCapsDropdownId"
                            onSelect={(eventKey, event) =>
                                this.onIoCapsSelect(event, eventKey)
                            }
                            variant="outline-secondary"
                        >
                            <Dropdown.Item eventKey={IO_CAPS_DISPLAY_ONLY}>
                                {keyToIoCapsText(IO_CAPS_DISPLAY_ONLY)}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={IO_CAPS_DISPLAY_YESNO}>
                                {keyToIoCapsText(IO_CAPS_DISPLAY_YESNO)}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={IO_CAPS_KEYBOARD_ONLY}>
                                {keyToIoCapsText(IO_CAPS_KEYBOARD_ONLY)}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={IO_CAPS_NONE}>
                                {keyToIoCapsText(IO_CAPS_NONE)}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={IO_CAPS_KEYBOARD_DISPLAY}>
                                {keyToIoCapsText(IO_CAPS_KEYBOARD_DISPLAY)}
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>
                <Row className="form-group">
                    <Col
                        sm={4}
                        className="form-label text-right align-baseline"
                    >
                        Authentication
                    </Col>
                    <Col sm={7}>
                        <Form.Group controlId="enableLescCheck">
                            <Form.Check
                                defaultChecked={this.state.lesc}
                                onChange={event =>
                                    this.handleCheckboxChange(
                                        'lesc',
                                        event.target.checked
                                    )
                                }
                                label="Enable LE Secure Connection pairing"
                            />
                        </Form.Group>
                        <Form.Group controlId="enableMitmCheck">
                            <Form.Check
                                defaultChecked={this.state.mitm}
                                onChange={event =>
                                    this.handleCheckboxChange(
                                        'mitm',
                                        event.target.checked
                                    )
                                }
                                label="Enable MITM protection"
                            />
                        </Form.Group>
                        <Form.Group controlId="enableOobCheck">
                            <Form.Check
                                defaultChecked={this.state.oob}
                                onChange={event =>
                                    this.handleCheckboxChange(
                                        'oob',
                                        event.target.checked
                                    )
                                }
                                label="Enable OOB data"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="form-group">
                    <Col sm={4} className="form-label text-right">
                        Keypress notifications
                    </Col>
                    <Col sm={7}>
                        <Form.Group controlId="enableKeypressCheck">
                            <Form.Check
                                defaultChecked={this.state.keypress}
                                onChange={event =>
                                    this.handleCheckboxChange(
                                        'keypress',
                                        event.target.checked
                                    )
                                }
                                label="Enable keypress notifications"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="form-group">
                    <Col
                        sm={4}
                        className="form-label text-right align-baseline"
                    >
                        Bonding
                    </Col>
                    <Col sm={7}>
                        <Form.Group controlId="performBondingCheck">
                            <Form.Check
                                defaultChecked={this.state.bond}
                                onChange={event =>
                                    this.handleCheckboxChange(
                                        'bond',
                                        event.target.checked
                                    )
                                }
                                label="Perform bonding"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Container>
        );
    }
}

SecurityParamsControls.propTypes = {
    onChange: PropTypes.func.isRequired,
    securityParams: PropTypes.object.isRequired,
};

export default SecurityParamsControls;
