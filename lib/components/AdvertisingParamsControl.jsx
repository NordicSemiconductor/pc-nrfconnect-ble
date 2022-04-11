/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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

import TextInput from './input/TextInput';

const SUCCESS = 'success';
const ERROR = 'error';

class AdvertisingParamsControl extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            interval: this.props.advParams.interval,
            timeout: this.props.advParams.timeout,
        };
    }

    validateInterval() {
        if (this.state.interval > 10240 || this.state.interval < 20)
            return ERROR;
        return SUCCESS;
    }
    validateTimeout() {
        if (this.state.timeout < 0) return ERROR;
        return SUCCESS;
    }

    handleChange(variableName, value) {
        this.setState({ [variableName]: +value }, () => {
            if (
                this.validateInterval() !== SUCCESS ||
                this.validateTimeout() !== SUCCESS
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
                    <Col sm={4} className="form-label text-right">
                        Interval (ms)
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.interval}
                            validationState={this.validateInterval()}
                            onChange={event =>
                                this.handleChange(
                                    'interval',
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
                        Timeout (s)
                    </Col>
                    <Col sm={7}>
                        <TextInput
                            type="number"
                            value={this.state.timeout}
                            validationState={this.validateTimeout()}
                            hasFeedback
                            onChange={event =>
                                this.handleChange('timeout', event.target.value)
                            }
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}

AdvertisingParamsControl.propTypes = {
    onChange: PropTypes.func.isRequired,
    advParams: PropTypes.object,
};

export default AdvertisingParamsControl;
