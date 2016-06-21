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

import React, { PropTypes } from 'react';
import Infinite from 'react-infinite';

import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import uuidV4 from 'uuid-v4';
import fs from 'fs';
import os from 'os';
import shell from 'shell';
import childProcess from 'child_process';

import { logger } from '../logging';
import { getLogFilePath } from '../logging/logger';

import * as LogActions from '../actions/logActions';
import LogEntry from '../components/LogEntry';

class LogContainer extends Component {
    constructor(props) {
        super(props);
        this.props.startReading();

        const { clear } = this.props;

        window.addEventListener('core:clear-log', () => { clear(); });
    }

    componentDidMount() {
        logger.info('Ready. Select serial port to connect to adapter.');
    }

    _openLogFile(path) {
        fs.exists(path, exists => {
            if (!exists) {
                logger.info(`Could not find log file at path: ${path}`);
                return;
            }

            const escapedPath = path.replace(/ /g, '\\ ');

            // Could not find a method that works on all three platforms:
            // * shell.openExternal works on Windows but not on OSX
            // * open (node-open) works on OSX but not on Windows
            // * childProcess.execSync works on OSX but not on Windows

            if (os.type() === 'Windows_NT') {
                shell.openExternal(escapedPath);
            } else if (os.type() === 'Darwin') {
                childProcess.execSync(`open  ${escapedPath}`);
            } else if (os.type() === 'Linux') {
                childProcess.execSync(`xdg-open ${escapedPath}`);
            }
        });
    }

    render() {
        const {
            autoScroll,
            logEntries,
            clear,
            toggleAutoScroll,
        } = this.props;

        const logFilePath = getLogFilePath();

        return (<div className='log-wrap'>
            <div className='log-header'>
                <div className='log-header-text'>Log</div>
                <div className='padded-row log-header-buttons'>
                    <button type='button' title='Open log file' className='btn btn-primary btn-xs btn-nordic' onClick={() => this._openLogFile(logFilePath)}>
                        <span className='icon-doc-text' aria-hidden='true' />
                    </button>
                    <button type='button' title='Clear log' className='btn btn-primary btn-xs btn-nordic' onClick={() => clear()}>
                        <span className='icon-trash' aria-hidden='true' />
                    </button>
                    <button type='button' title='Scroll automatically' className={'btn btn-primary btn-xs btn-nordic ' + (autoScroll ? 'active' : '')} onClick={() => toggleAutoScroll()}>
                        <span className='icon-down' aria-hidden='true' />
                    </button>
                </div>
            </div>

            <Infinite elementHeight={20}
                             containerHeight={155}
                             infiniteLoadBeginEdgeOffset={135}
                             className='infinite-log'
                             autoScroll={autoScroll}
                             >
                 {logEntries.map(entry => <LogEntry {...{entry}} key={uuidV4()} />)}
            </Infinite>
        </div>);
    }
}

function mapStateToProps(state) {
    const { log } = state;

    return {
        logEntries: log.entries,
        autoScroll: log.autoScroll,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(LogActions, dispatch)
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogContainer);

LogContainer.propTypes = {
    logEntries: PropTypes.object.isRequired,
    autoScroll: PropTypes.bool.isRequired,
    toggleAutoScroll: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired,
    startReading: PropTypes.func.isRequired,
    stopReading: PropTypes.func.isRequired,
};
