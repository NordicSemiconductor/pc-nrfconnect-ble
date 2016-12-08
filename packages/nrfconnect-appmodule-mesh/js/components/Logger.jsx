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

import React, { Component, PropTypes } from 'react';
import { connnect } from 'react-redux'
import Infinite from 'react-infinite'

import DeviceDropdown from './FilterDeviceDropdown'

import * as LoggerActions from '../actions/loggerActions'
import { getLogFilePath } from '../logging/logger';
import fs from 'fs';
import {shell} from 'electron';
// TODO:
// We might would like to use the same logging window
// for mesh and non-mesh logging. Then we might want
// to parametrize the columns in the table, unless we
// do not make any assumptions about the format of
// the mesh logging data.

const LogHeader = props => {
    return (
        <div className='log-entry'>
            <div className='log-device'>Device</div>
            <div className='time'>Timestamp</div>
            <div className='message'>Data</div>
        </div>
    )
}

const LogEntry = props => {
    const { device = '',
        timestamp = '',
        data = '' } = props;
    return (
        <div className='log-entry'>
            <div className='log-device'>{device}</div>
            <div className='time'>{timestamp}</div>
            <div className='message'>{data}</div>
        </div>
    )
}

const NordicButton = props => {
    const { active, className, ...others } = props;
    let classes = 'btn btn-primary btn-xs btn-nordic '
    if (className) {
        classes += className
    }
    if (active) {
        classes += ' active';
    }
    return (
        <button type='button'
            className={classes}
            {...others}>
            {props.children}
        </button>
    )
}

class Logger extends Component {

    render() {
        const {
            logs,
            devices,
            running,
            autoScroll,
            clearLogCallback,
            autoScrollCallback,
            openLogFileCallback,
            startStopProcessCallback,
            deviceSelectionCallback,
            toggleLogFunc,
        } = this.props;

        // Only include buttons if they have a callback.
        // This way its easy to choose which button you want.
        // Is this actually convenient, or just really dumb?
        let autoScrollButton;
        if (autoScrollCallback) {
            autoScrollButton = (
                <NordicButton
                    title='Scroll automatically'
                    active={autoScroll}
                    onClick={autoScrollCallback}>
                    <span className='icon-down' aria-hidden='true' />
                </NordicButton>
            );
        }

        let clearLogButton;
        if (clearLogCallback) {
            clearLogButton =
                <NordicButton
                    title='Clear log'
                    onClick={clearLogCallback}
                    >
                    <span className='icon-trash' aria-hidden='true' />
                </NordicButton>
        }

        let openLogFileButton;
        if (openLogFileCallback) {
            openLogFileButton =
                <NordicButton
                    title='Open log file'
                    onClick={openLogFileCallback}
                    >
                    <span className='icon-doc-text' aria-hidden='true' />
                </NordicButton>
        }

        let startStopProcessButton;
        if (startStopProcessCallback) {
            startStopProcessButton =
                <NordicButton
                    title='Restart logging process'
                    onClick={startStopProcessCallback}
                    >
                    <span className={running ? 'icon-stop' : 'icon-play'} aria-hidden='true' />
                </NordicButton >
        }

        let toggleLoggerButton;
        if (true) {
            toggleLoggerButton =
                <NordicButton
                    title='toggleLog'
                    onClick={toggleLogFunc}
                    >
                    <span className='icon-arrows-cw' aria-hidden='true' />
                </NordicButton >
        }

        let deviceSelectionDropdown;
        if (deviceSelectionCallback) {
            deviceSelectionDropdown =
                <DeviceDropdown
                    labels={devices}
                    onClick={deviceSelectionCallback}
                    />
        }

        return (<div className='log-wrap'>
            <div className='log-header'>
                { toggleLoggerButton }
                <div className='log-header-text'>RTT-Log</div>
                <div className='padded-row log-header-buttons'>
                    { openLogFileButton }
                    { clearLogButton }
                    { autoScrollButton }
                    { deviceSelectionDropdown }
                    { startStopProcessButton }
                </div>
            </div>

            <Infinite elementHeight={20}
                className='infinite-log'
                useWindowAsScrollContainer
                autoScroll={autoScroll} >
                <LogHeader />
                {logs.map((entry, i) =>
                    <LogEntry {...entry} key={i} />) }
            </Infinite>
        </div>
        )
    }
}

export default Logger;
