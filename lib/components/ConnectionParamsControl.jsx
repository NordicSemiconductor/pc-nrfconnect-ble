/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable react/state-in-constructor */
/* eslint react/forbid-prop-types: off */
/* eslint jsx-a11y/label-has-for: off */
/* eslint jsx-a11y/label-has-associated-control: off */
/* eslint-disable react/destructuring-assignment */

'use strict';

import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';

import {
    CONN_INTERVAL_MAX,
    CONN_INTERVAL_MIN,
    CONN_INTERVAL_STEP,
    CONN_LATENCY_MAX,
    CONN_LATENCY_MIN,
    CONN_TIMEOUT_MAX,
    CONN_TIMEOUT_MIN,
    CONN_TIMEOUT_STEP,
} from './ConnectionUpdateRequestEditor';
import TextInput from './input/TextInput';

const SUCCESS = 'success';
const ERROR = 'error';

const multipleOf = (value, multiplier) => value % multiplier !== 0;

const validator = predicate => (predicate ? ERROR : SUCCESS);

class ConnectionParamsControl extends React.PureComponent {
    state = {
        connectionInterval: this.props.connectionParameters.connectionInterval,
        slaveLatency: this.props.connectionParameters.slaveLatency,
        connectionSupervisionTimeout:
            this.props.connectionParameters.connectionSupervisionTimeout,
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
