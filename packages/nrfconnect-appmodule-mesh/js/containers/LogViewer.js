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

import { logger } from '../logging';

import { getLogFilePath } from '../logging/logger';
import { openFileInDefaultApplication } from '../utils/fileUtil';

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
        // logger.info('Ready. Select serial port to connect to adapter.');
    }

    _openLogFile(path) {
        openFileInDefaultApplication(path, err => {
            if (err) {
                logger.info(err);
            }
        });
    }

    render() {
        const {
            autoScroll,
            logEntries,
            clear,
            toggleAutoScroll,
            toggleRTTLog,
            spawnLogger,
            removePartOfLog,
            dfuIsRunning
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
                    {{ dfuIsRunning } && <button type='button' className={'btn btn-primary btn-xs btn-nordic'}
                        title='Start Segger RTT logger'
                        onClick={spawnLogger}
                        >
                        <span className='icon-play' aria-hidden='true' />
                        Start RTT
                    </button>}
                    {!{ dfuIsRunning } && <button type='button' className={'btn btn-primary btn-xs btn-nordic'}
                        title='Stop RTT'
                        onClick={console.log("TODO: Implement stop RTT")}
                        >
                        <span className='icon-play' aria-hidden='true' />
                        Start RTT
                    </button>}
                </div>
            </div>

            <Infinite elementHeight={20}
                containerHeight={650}
                infiniteLoadBeginEdgeOffset={135}
                className='infinite-log'
                autoScroll={autoScroll}
                >
                {logEntries.map(entry => <LogEntry {...{entry}} key={uuidV4()} />)}
                 
            </Infinite>
        </div>);
    }
}
                //Old works
                //  {logEntries.map(entry => <LogEntry {...{entry}} key={uuidV4()} />)}
                //{logEntries.map(ent => {
                //     let messages = ent.message.split("\n")
                //     let entires = []
                //     for (i in messages) {
                //         if (messages[i] !== "") {
                //             obj= {
                //                 id: ent.id,
                //                 meta: ent.meta,
                //                 message: messages[i],
                //                 time :ent.time,
                //                 level: ent.level,
                //             }
                //             entires.push(obj)                    
                //         }
                //     }
                //     return entires.map(entry => <LogEntry {...{entry}} key={uuidV4()} />)
                // })}

function mapStateToProps(state) {
    const { log, dfu } = state;

    return {
        logEntries: log.entries,
        autoScroll: log.autoScroll,
        dfuIsRunning: dfu.isRunning,
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
