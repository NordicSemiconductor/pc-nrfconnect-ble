/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CountdownTimer extends Component {
    constructor(props) {
        super(props);
        this.secondsRemaining = props.seconds;
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    cancelTimer() {
        clearInterval(this.intervalId);
    }

    tick() {
        const { onTimeout } = this.props;
        this.secondsRemaining -= 1;
        this.forceUpdate();

        if (this.secondsRemaining <= 0) {
            clearInterval(this.interval);

            if (onTimeout) {
                onTimeout();
            }
        }
    }

    render() {
        const content = this.secondsRemaining || '';
        return <div className="countdown-timer"> {content} </div>;
    }
}

CountdownTimer.propTypes = {
    seconds: PropTypes.number.isRequired,
    onTimeout: PropTypes.func.isRequired,
};

export default CountdownTimer;
