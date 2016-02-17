/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

 'use strict';

import React, { PropTypes, Component } from 'react';

export class CountdownTimer extends Component {
    constructor(props) {
        super(props);
        this.secondsRemaining = props.seconds;
    }

    _tick() {
        this.secondsRemaining = --this.secondsRemaining;
        this.forceUpdate();

        if (this.secondsRemaining <= 0) {
            clearInterval(this.interval);

            if (this.props.onTimeout) {
                this.props.onTimeout();
            }
        }
    }

    cancelTimer() {
        clearInterval(this.intervalId);
    }

    componentDidMount() {
        this.interval = setInterval(() => this._tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const content = this.secondsRemaining ? this.secondsRemaining : '';
        return (
            <div className='countdown-timer'> {content} </div>
        );
    }
}

CountdownTimer.propTypes = {
    seconds: PropTypes.number.isRequired,
    onTimeout: PropTypes.func.isRequired,
};
