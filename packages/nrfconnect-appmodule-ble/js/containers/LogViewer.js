/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React, { PropTypes } from 'react';
import Infinite from 'react-infinite';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import uuidV4 from 'uuid-v4';

import { logger } from '../logging';
import { getLogFilePath } from '../logging/logger';
import { openFileInDefaultApplication } from '../utils/fileUtil';

import * as LogActions from '../actions/logActions';
import LogEntry from '../components/LogEntry';

class LogContainer extends React.PureComponent {
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
