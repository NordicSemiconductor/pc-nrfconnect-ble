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

import PropTypes from 'prop-types';
import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TextInput from './input/TextInput';

class ConnectionParamsControl extends React.PureComponent {
    state = {
        slaveLatency: 0,
        connectionSupervisionTimeout: 0,
        minConnectionInterval: 0,
        maxConnectionInterval: 0,
    };

    // validation functions
    handleChange(variableName, value) {
        this.setState({ [variableName]: +value }, () => {
            if (value < 0) {
                // edres til success og error
                this.props.onChange(null);
                return;
            }
            this.props.onChange(this.state);
        });
    }

    render() {
        return (
            <Container>
                <Row className="form-group">
                    <Col sm={4} className="form-label text-right">
                        Slave Latency
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.slaveLatency}
                            // validationState={this.validateInterval()}
                            onChange={event =>
                                this.handleChange(
                                    'slaveLatency',
                                    event.target.value
                                )
                            }
                        />
                    </Col>
                </Row>
                <Row className="form-group">
                    <Col
                        sm={4}
                        className="form-label text-right align-baseline"
                    >
                        Connection supervision timeout
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.connectionSupervisionTimeout}
                            // validationState={this.validateTimeout()}
                            hasFeedback
                            onChange={event =>
                                this.handleChange(
                                    'connectionSupervisionTimeout',
                                    event.target.value
                                )
                            }
                        />
                    </Col>
                </Row>
                <Row className="form-group">
                    <Col
                        sm={4}
                        className="form-label text-right align-baseline"
                    >
                        Min Connection Interval
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.minConnectionInterval}
                            // validationState={this.validateTimeout()}
                            hasFeedback
                            onChange={event =>
                                this.handleChange(
                                    'minConnectionInterval',
                                    event.target.value
                                )
                            }
                        />
                    </Col>
                </Row>
                <Row className="form-group">
                    <Col
                        sm={4}
                        className="form-label text-right align-baseline"
                    >
                        maxConnectionInterval: 0,
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.maxConnectionInterval}
                            // validationState={this.validateTimeout()}
                            hasFeedback
                            onChange={event =>
                                this.handleChange(
                                    'maxConnectionInterval',
                                    event.target.value
                                )
                            }
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}

ConnectionParamsControl.propTypes = {
    onChange: PropTypes.func.isRequired,
};

export default ConnectionParamsControl;
