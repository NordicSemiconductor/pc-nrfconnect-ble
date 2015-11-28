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
