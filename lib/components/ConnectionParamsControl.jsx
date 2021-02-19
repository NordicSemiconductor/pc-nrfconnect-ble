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
import {
    CONN_INTERVAL_MIN,
    CONN_INTERVAL_MAX,
    CONN_TIMEOUT_MIN,
    CONN_TIMEOUT_MAX,
    CONN_LATENCY_MIN,
    CONN_LATENCY_MAX,
    CONN_TIMEOUT_STEP,
    CONN_INTERVAL_STEP,
} from './ConnectionUpdateRequestEditor';

const SUCCESS = 'success';
const ERROR = 'error';

const multipleOf = (value, multiplier) => value % multiplier !== 0;

const validator = predicate => (predicate ? ERROR : SUCCESS);

class ConnectionParamsControl extends React.PureComponent {
    state = {
        connectionInterval: this.props.connectionParameters.connectionInterval,
        slaveLatency: this.props.connectionParameters.slaveLatency,
        connectionSupervisionTimeout: this.props.connectionParameters
            .connectionSupervisionTimeout,
    };

    validateConnectionInterval() {
        const { connectionInterval } = this.state;
        return validator(
            connectionInterval < CONN_INTERVAL_MIN ||
                connectionInterval > CONN_INTERVAL_MAX ||
                multipleOf(connectionInterval, 1.25)
        );
    }

    validateConnectionSupervisionTimeout() {
        // bigger than: (1+latency)*max_con_interval*2, or 100ms
        // multiple of 10 ms
        const {
            connectionSupervisionTimeout,
            slaveLatency,
            maxConnectionInterval,
        } = this.state;
        const bound = (1 + slaveLatency) * 2 * maxConnectionInterval;
        const lowerBound = bound > CONN_TIMEOUT_MIN ? bound : CONN_TIMEOUT_MIN;
        return validator(
            connectionSupervisionTimeout < lowerBound ||
                connectionSupervisionTimeout > CONN_TIMEOUT_MAX ||
                multipleOf(connectionSupervisionTimeout, 10)
        );
    }

    validateSlaveLatency() {
        // less than: (supervision_timeout/(max_con_interval*2))-1, or 500
        const {
            slaveLatency,
            connectionSupervisionTimeout,
            maxConnectionInterval,
        } = this.state;
        const bound =
            connectionSupervisionTimeout / (maxConnectionInterval * 2) - 1;
        const upperbound = bound < CONN_LATENCY_MAX ? bound : CONN_LATENCY_MAX;
        return validator(
            slaveLatency < CONN_LATENCY_MIN ||
                slaveLatency > upperbound ||
                multipleOf(slaveLatency, 1)
        );
    }

    handleChange(variableName, value) {
        this.setState({ [variableName]: +value }, () => {
            if (
                [
                    this.validateSlaveLatency(),
                    this.validateConnectionInterval(),
                    this.validateConnectionSupervisionTimeout(),
                ].includes(ERROR)
            ) {
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
                    <Col sm={5} className="form-label text-right">
                        Slave latency
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.slaveLatency}
                            validationState={this.validateSlaveLatency()}
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
                        sm={5}
                        className="form-label text-right align-baseline"
                    >
                        Supervision timeout (ms)
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.connectionSupervisionTimeout}
                            validationState={this.validateConnectionSupervisionTimeout()}
                            step={CONN_TIMEOUT_STEP}
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
                        sm={5}
                        className="form-label text-right align-baseline"
                    >
                        Connection interval (ms)
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.connectionInterval}
                            validationState={this.validateConnectionInterval()}
                            step={CONN_INTERVAL_STEP}
                            hasFeedback
                            onChange={event =>
                                this.handleChange(
                                    'connectionInterval',
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
    connectionParameters: PropTypes.object,
};

export default ConnectionParamsControl;
