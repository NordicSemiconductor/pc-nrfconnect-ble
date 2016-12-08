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

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Logger from '../components/Logger';
import * as LoggerActions from '../actions/loggerActions'
import * as LogActions from '../actions/logActions'



import * as FileUtils from '../utils/file';
import { getLogFilePath } from '../logging/logger';

class LoggingContainer extends Component {
    constructor(props) {
        super(props)

        this.clearLog = this.clearLog.bind(this);
        this.toggleLog = this.toggleRTTLogCont.bind(this)
        this.deviceSelection = this.deviceSelection.bind(this);
        this.startLoggingProcess = this.startLoggingProcess.bind(this);
        this.stopLoggingProcess = this.stopLoggingProcess.bind(this);
        this.toggleAutoScrolling = this.toggleAutoScrolling.bind(this);
        this.startStopLoggingProcess = this.startStopLoggingProcess.bind(this);

        props.startReading();
    }

    startLoggingProcess() {
        this.props.spawnLogger();
    }

    stopLoggingProcess() {
        const { running, logger } = this.props.logger;
        if (running && logger) {
            this.props.killLogger(logger);
        }
    }

    startStopLoggingProcess(running) {
        if (running) {
            this.stopLoggingProcess()
        } else {
            this.clearLog()
            this.startLoggingProcess()
        }
    }

    toggleAutoScrolling() {
        this.props.toggleAutoScrollLog();
    }

    clearLog () {
        this.props.clearLog();
    }

    toggleRTTLogCont () {
        this.props.toggleRTTLog();
    }

    deviceSelection(devices) {
        this.props.filterLogByDevice(devices)
    }

    render() {
        const { devices, logger: { logs, autoScroll, errorCount, running }} = this.props;

        return (
            <Logger
                autoScrollCallback={this.toggleAutoScrolling}
                clearLogCallback={this.clearLog}
                startStopProcessCallback={() => this.startStopLoggingProcess(running)}
                deviceSelectionCallback={this.deviceSelection}
                toggleLogFunc={this.toggleLog}

                errorCount={errorCount}
                logs={logs}
                autoScroll={autoScroll}
                devices={devices}
                running={running}
            />
        );
    }
}

function mapStateToProps(state) {
  return {
    logger: state.logger
  };
}

function mapDispatchToProps(dispatch) {
    return Object.assign({},
        bindActionCreators(LoggerActions, dispatch),
        bindActionCreators(LogActions, dispatch)
    );
}


export default connect(mapStateToProps, mapDispatchToProps)(LoggingContainer);
